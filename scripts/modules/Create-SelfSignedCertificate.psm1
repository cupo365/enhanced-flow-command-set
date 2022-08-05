<#
    .SYNOPSIS
        Script to create a self-signed certificate.

    .DESCRIPTION
        This script allows you to create a self-signed certificate and its private key information file.
        The certificate can be used to authenticate identities, like Azure app registrations.
        The script also automatically removes the created certificate from the user's keystore.

    .PARAMETER certificateName <string> [required]
        The name of the certificate.

    .PARAMETER certificatePwd <string> [required]
        The password used for certificate encryption.

    .PARAMETER monthsValid <int> [required]
        The number of months before the certificate becomes invalid.

    .PARAMETER folderPath <string> [required]
        The (relative) folder path the certificate should be created in.
#>

<# ---------------- Program execution ---------------- #>

Function Create-SelfSignedCertificate (
  [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$certificateName,
  [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$certificatePwd,
  [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][int]$monthsValid,
  [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$folderPath) {
  Try {
    $certificateSecurePwd = ConvertTo-SecureString $certificatePwd -AsPlainText -Force

    If ($folderPath.Substring($folderPath.Length - 1) -ne "/" -Or $folderPath.Substring($folderPath.Length - 1) -ne "\") {
      $folderPath = $folderPath + "/"
    }

    $fullPath = $folderPath + $certificateName

    Write-Host "`nCreating certificate..."
    $cert = New-SelfSignedCertificate -Subject "CN=$($certificateName)" -CertStoreLocation "Cert:\CurrentUser\My" -KeyExportPolicy Exportable -KeySpec Signature -KeyLength 2048 -KeyAlgorithm RSA -HashAlgorithm SHA256 -NotAfter (Get-Date).AddMonths($monthsValid)
    Export-Certificate -Cert $cert -FilePath "$($fullPath).cer" | Out-Null

    Write-Host "Creating private key for the certificate..."
    Export-PfxCertificate -Cert $cert -FilePath "$($fullPath).pfx" -Password $certificateSecurePwd | Out-Null

    Write-Host "Removing created certificate from the user's personal keystore..."
    $keyStoreCertThumbPrint = Get-ChildItem -Path "Cert:\CurrentUser\My" | Where-Object { $_.Subject -Match $Name } | Select-Object Thumbprint
    Remove-Item -Path "Cert:\CurrentUser\My\$($keyStoreCertThumbPrint.Thumbprint)" -DeleteKey -ErrorAction SilentlyContinue | Out-Null

    Write-Host "`n------------------------------------------------------------------------" -ForegroundColor Magenta

    Write-Host "`nSuccessfully created the self-signed certificate!" -ForegroundColor Green
    Write-Host "Certificate thumbnail  :     $($cert.Thumbprint)" -ForegroundColor Green
    Write-Host "Certificate password   :     $($certificatePwd)" -ForegroundColor Green
    Write-Host "Output folder          :     $($fullPath)" -ForegroundColor Green

    Write-Host "`nDone." -ForegroundColor Magenta
  }
  Catch [Exception] {
    Write-Host "`nAn error occurred: $($_.Exception.Message)" -ForegroundColor Red
    throw $_.Exception
  }
}

Export-ModuleMember -Function Create-SelfSignedCertificate
