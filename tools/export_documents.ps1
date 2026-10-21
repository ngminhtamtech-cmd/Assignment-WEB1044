param([string]$RenderDirectory = 'tmp\documents-render')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$outputFolder = Join-Path $projectRoot $RenderDirectory
New-Item -ItemType Directory -Path $outputFolder -Force | Out-Null
$wordInstance = $null
try {
    $wordInstance = New-Object -ComObject Word.Application
    $wordInstance.Visible = $false
    $wordInstance.DisplayAlerts = 0
    foreach ($name in @('BaoCao_Assignment2_PC-Astral-Market','UseCase_Logic_Ham_PC-Astral-Market')) {
        $document = $null
        try {
            $document = $wordInstance.Documents.Open((Join-Path $projectRoot ($name + '.docx')), $false, $false)
            $document.UpdateStylesOnOpen = $false
            foreach ($styleName in @('Normal','Title','Subtitle','Heading 1','Heading 2','Caption','TOC 1','TOC 2')) {
                $style = $document.Styles.Item($styleName)
                $style.Font.Name = 'Times New Roman'
                $style.Font.NameAscii = 'Times New Roman'
                $style.Font.NameOther = 'Times New Roman'
                $style.Font.Color = 0
            }
            $document.Styles.Item('Title').ParagraphFormat.Borders.Enable = 0
            $document.Fields.Update() | Out-Null
            foreach ($contents in $document.TablesOfContents) { $contents.Update() }
            $document.Repaginate()
            foreach ($contents in $document.TablesOfContents) { $contents.UpdatePageNumbers() }
            $document.Save()
            $document.ExportAsFixedFormat((Join-Path $outputFolder ($name + '.pdf')), 17)
            Write-Output ($name + ': ' + $document.ComputeStatistics(2) + ' pages')
        } finally {
            if ($document) { $document.Close($false); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($document) }
        }
    }
} finally {
    if ($wordInstance) { $wordInstance.Quit(); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($wordInstance) }
}
