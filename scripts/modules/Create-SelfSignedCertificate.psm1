<#
    .SYNOPSIS
        Script to create a self signed certificate.

    .DESCRIPTION
        This script allows you to create a self signed certificate and its private key information file.
        The certificate can be used to authenticate identities, like Azure app registrations.
        The script creates the certificate in the PowerShell working directory.
        The script also automatically removes the created certificate from the user's keystore.

    .PARAMETER certificateName <string> [required]
        The name of the certificate.

    .PARAMETER certificatePwd <string> [required]
        The name password for the certificate encryption.

    .PARAMETER monthsValid <int> [required]
        The number of months before the certificate becomes invalid.
#>

<# ---------------- Program execution ---------------- #>

Function Create-SelfSignedCertificate (
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$certificateName,
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][System.Security.SecureString]$certificatePwd,
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][int]$monthsValid) {
    Try {
        $certificateName = "$($certificateName)"

        Write-Host "Creating certificate..."
        $cert = New-SelfSignedCertificate -Subject "CN=$($certificateName)" -CertStoreLocation "Cert:\CurrentUser\My" -KeyExportPolicy Exportable -KeySpec Signature -KeyLength 2048 -KeyAlgorithm RSA -HashAlgorithm SHA256 -NotAfter (Get-Date).AddMonths($monthsValid)
        Export-Certificate -Cert $cert -FilePath "../$($certificateName).cer" | Out-Null
        Write-Host "Successfully created the certificate!" -ForegroundColor Green
        
        Write-Host "Creating private key for the certificate..."
        Export-PfxCertificate -Cert $cert -FilePath "../$($certificateName).pfx" -Password $certificatePwd | Out-Null
        Write-Host "Successfully created the private key!" -ForegroundColor Green
    
        Write-Host "Removing created certificate from the user's personal keystore..."
        $keyStoreCertThumbPrint = Get-ChildItem -Path "Cert:\CurrentUser\My" | Where-Object { $_.Subject -Match $Name } | Select-Object Thumbprint
        Remove-Item -Path "Cert:\CurrentUser\My\$($keyStoreCertThumbPrint.Thumbprint)" -DeleteKey -ErrorAction SilentlyContinue | Out-Null
        Write-Host "Successfully removed the certificate from the personal keystore!" -ForegroundColor Green
    
        Write-Host "`nDone." -ForegroundColor Green
    }
    Catch [Exception] {
        Write-Host "`nAn error occurred: $($_.Exception.Message)" -ForegroundColor Red
        throw $_.Exception
    }
}

Export-ModuleMember -Function Create-SelfSignedCertificate