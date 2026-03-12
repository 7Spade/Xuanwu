import {
  FileArchive,
  FileCode,
  FileJson,
  FileText,
  ImageIcon,
} from 'lucide-react';

interface FileTypeIconProps {
  readonly fileName: string;
}

export function FileTypeIcon({ fileName }: FileTypeIconProps) {
  const ext = fileName.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <ImageIcon className="size-5" />;
    case 'zip':
    case '7z':
    case 'rar':
      return <FileArchive className="size-5" />;
    case 'ts':
    case 'tsx':
    case 'js':
      return <FileCode className="size-5" />;
    case 'json':
      return <FileJson className="size-5" />;
    default:
      return <FileText className="size-5" />;
  }
}
