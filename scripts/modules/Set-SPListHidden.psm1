<#
    .SYNOPSIS
        Script to hide a SharePoint list.

    .DESCRIPTION
        This script allows you to hide a SharePoint list so that it is only accessible via a direct link.
        This script uses the PnP.PowerShell PowerShell module.

    .PARAMETER SiteUrl <string> [required]
        The URL of the SharePoint site on which the list that should be hidden resides.

    .PARAMETER ListName <string> [required]
        The name of the SharePoint list to hide.
    
    .PARAMETER Modules <array> [optional]
        The required PowerShell modules to execute the program.
        Default value is "PnP.PowerShell" (minimum required).
#>

<# ---------------- Program execution ---------------- #>

Function Set-SPListHidden (
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string] $SiteUrl,
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string] $ListName,
    [parameter(Mandatory = $false)][array] $Modules = ("PnP.PowerShell")) {
    Try {
        Initialize -Modules $Modules -SiteUrl $SiteUrl

        Write-Host "`n|-------------------------[ (3/3) Hiding list ]---------------------------|" -ForegroundColor Cyan
        Write-Host "`nAttempting to hide list '$($ListName)'..." -ForegroundColor Magenta
        Set-PnPList -Identity $ListName -Hidden $True | Out-Null
        Write-Host "Success!" -ForegroundColor Green
    }
    Catch [Exception] {
        Write-Host "`nAn error occurred on line $($_.InvocationInfo.ScriptLineNumber) while hiding the SP list. Message: $($_.Exception.Message)" -ForegroundColor Yellow

        Write-Host "Terminating program. Reason: encountered an error before program could successfully finish." -ForegroundColor Red
    }
    Finally {
        Finish-Up
    }
}

Export-ModuleMember -Function Set-SPListHidden


<# ---------------- Helper functions ---------------- #>
Function Initialize {
    [cmdletbinding()]
    param(
        [parameter(Mandatory = $true)][array] $Modules,
        [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string] $SiteUrl
    )

    Try {
        Write-Host "`n|-----------------------[ (1/3) Importing modules ]-----------------------|" -ForegroundColor Cyan
        Foreach ($Module in $Modules) {
            Import-PSModule -ModuleName $Module
        }

        Write-Host "`n|-------------------[ (2/3) Connecting to SharePoint ]--------------------|" -ForegroundColor Cyan
        Write-Host "`nConnecting to SharePoint..." -ForegroundColor Magenta
        Connect-PnPOnline -Url $SiteUrl -Credentials (Get-Credential) | Out-Null
        Write-Host "Connected!" -ForegroundColor Green
    }
    Catch [Exception] {
        Write-Host "An error occurred on line $($_.InvocationInfo.ScriptLineNumber) while initializing. Message: $($_.Exception.Message)" -ForegroundColor Yellow

        Write-Host "Terminating program. Reason: could not initialize." -ForegroundColor Red
        Finish-Up
    }
}

Function Import-PSModule {
    [cmdletbinding()]
    param(
        [parameter(Mandatory = $true)] [ValidateNotNullOrEmpty()] [string] $ModuleName,
        [parameter(Mandatory = $false)] [boolean] $AttemptedBefore
    )

    Try {
        # Import module
        Write-Host "`nImporting $($ModuleName) module..." -ForegroundColor Magenta
        Import-Module -Name $ModuleName -Scope Local -Force -ErrorAction Stop | Out-Null
        Write-Host "Successfully imported $($ModuleName)!" -ForegroundColor Green
    }
    Catch [Exception] {
        Write-Host "$($ModuleName) was not found on the specified location." -ForegroundColor Yellow

        If ($true -eq $AttemptedBefore) {
            Write-Host "Terminating program. Reason: could not import dependend modules." -ForegroundColor Red
            Finish-Up
        }
        Else {            
            Install-PSModule -ModuleName $ModuleName
        }
    }
}

Function Install-PSModule {
    [cmdletbinding()]
    param(
        [parameter(Mandatory = $true)] [ValidateNotNullOrEmpty()] [string] $ModuleName
    )

    Try {
        # Install module
        Write-Host "`nInstalling $($ModuleName) module..." -ForegroundColor Magenta
        Install-Module -Name $ModuleName -Scope CurrentUser -AllowClobber -Force -ErrorAction Stop | Out-Null
        Write-Host "Successfully installed $($ModuleName)!" -ForegroundColor Green

        #Import-PSModule -ModuleName $ModuleName -AttemptedBefore $true
    }
    Catch [Exception] {
        Write-Host "Could not install $($ModuleName)." -ForegroundColor Yellow
        
        Write-Host "Terminating program. Reason: could not install dependend modules." -ForegroundColor Red
        Finish-Up
    }
}

Function Finish-Up {
    Try {
        Write-Host "`n|----------------------------[ Finishing up ]-----------------------------|" -ForegroundColor Cyan

        Write-Host "`nDisconnecting the session..." -ForegroundColor Magenta
        Disconnect-PnPOnline | Out-Null
        Write-Host "Disconnected!" -ForegroundColor Green

        Write-Host "`n|------------------------------[ Finished ]-------------------------------|`n" -ForegroundColor Cyan

        exit 1
    }
    Catch [Exception] {
        Write-Host "`n|------------------------------[ Finished ]-------------------------------|`n" -ForegroundColor Cyan
        exit 1
    }
}