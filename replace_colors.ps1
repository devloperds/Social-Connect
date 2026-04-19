$files = Get-ChildItem -Path "c:\Users\darsh\Downloads\Social-Connect\src" -Recurse -Include "*.tsx","*.ts"
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $content = $content -replace 'indigo-200/50','teal-200/50'
    $content = $content -replace 'indigo-300/60','teal-300/60'
    $content = $content -replace 'indigo-300','teal-300'
    $content = $content -replace 'indigo-200','teal-200'
    $content = $content -replace 'indigo-600','teal-600'
    $content = $content -replace 'indigo-700','teal-700'
    $content = $content -replace 'indigo-500','teal-500'
    $content = $content -replace 'indigo-50/80','teal-50/80'
    $content = $content -replace 'indigo-100/80','teal-100/80'
    $content = $content -replace 'indigo-50','teal-50'
    $content = $content -replace 'purple-200/40','cyan-200/40'
    $content = $content -replace 'purple-100/30','cyan-100/30'
    $content = $content -replace 'pink-100/30','sky-100/30'
    Set-Content $file.FullName $content -NoNewline
}
Write-Host "Done replacing colors"
