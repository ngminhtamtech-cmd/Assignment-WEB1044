# Chỉ mở tài liệu câu hỏi, không lưu hoặc xuất lại hai tài liệu cũ.
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$documentPath = Join-Path $projectRoot 'Bộ-câu-hỏi.docx'
$outputFolder = Join-Path $projectRoot 'tmp/defense/render'
New-Item -ItemType Directory -Path $outputFolder -Force | Out-Null
$wordInstance = $null
$document = $null
try {
    $wordInstance = New-Object -ComObject Word.Application
    $wordInstance.Visible = $false
    $wordInstance.DisplayAlerts = 0
    $document = $wordInstance.Documents.Open($documentPath, $false, $false)
    $document.UpdateStylesOnOpen = $false
    $document.Fields.Update() | Out-Null
    foreach ($contents in $document.TablesOfContents) { $contents.Update() }
    $document.Repaginate()
    foreach ($contents in $document.TablesOfContents) { $contents.UpdatePageNumbers() }
    $document.Save()
    $document.ExportAsFixedFormat((Join-Path $outputFolder 'questions.pdf'), 17)
    Write-Output ('Questions document: ' + $document.ComputeStatistics(2) + ' pages')
} finally {
    if ($document) { $document.Close($false); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($document) }
    if ($wordInstance) { $wordInstance.Quit(); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($wordInstance) }
}
