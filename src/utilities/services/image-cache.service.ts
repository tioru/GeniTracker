import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { map, tap } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ImageCacheService {

private http = inject(HttpClient);

private sanitizer = inject(DomSanitizer);

public imageObjectUrls = new Map<string, string>();

private fileObjectUrls = new Map<File, string>();

  public loadImage(url: string) {
    return this.http.get(url, { responseType: 'blob' }).pipe(
      tap(blob => {
        const objectURL = URL.createObjectURL(blob);
        this.imageObjectUrls.set(url, objectURL);
      }),
      map(blob => URL.createObjectURL(blob))
    );
  }

  public getImageUrl(url: string): SafeUrl {
    const objectUrl = this.imageObjectUrls.get(url);
    return objectUrl ? this.sanitizer.bypassSecurityTrustUrl(objectUrl) : url;
  }

  public getFileUrl(file: File): string {
    if (!file) return '';

    if (this.fileObjectUrls.has(file)) {
      return this.fileObjectUrls.get(file)!;
    }

    const url = URL.createObjectURL(file);
    this.fileObjectUrls.set(file, url);
    return url;
  }

  public revokeFileUrl(file: File): void {
    const url = this.fileObjectUrls.get(file);
    if (url) {
      URL.revokeObjectURL(url);
      this.fileObjectUrls.delete(file);
    }
  }

  ngOnDestroy(): void {
    this.imageObjectUrls.forEach(url => URL.revokeObjectURL(url));
    this.imageObjectUrls.clear();

    this.fileObjectUrls.forEach(url => URL.revokeObjectURL(url));
    this.fileObjectUrls.clear();
  }
}