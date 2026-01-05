import { Pipe, PipeTransform } from '@angular/core';
import { ProjectClass } from '../classes/class';

@Pipe({
  name: 'fileExtension',
  standalone: true
})
export class FileExtensionPipe implements PipeTransform {
  transform(attachedFile: ProjectClass.Local.AttachedFile): string {
    const cuttedName = attachedFile.file?.name.split(".")
    return cuttedName ? cuttedName[cuttedName.length - 1] : ""
  }
}

export const FILE_PIPES = [
  FileExtensionPipe
];