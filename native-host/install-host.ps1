$manifestPath = "F:\PersonalProjects\Extensions\quick-save\native-host\native-host.json"

$regPath = "HKCU:\Software\Google\Chrome\NativeMessagingHosts\com.quicksave.host"

New-Item -Path $regPath -Force | Out-Null

Set-ItemProperty -Path $regPath -Name "(default)" -Value $manifestPath

Write-Host "Native host installed successfully"