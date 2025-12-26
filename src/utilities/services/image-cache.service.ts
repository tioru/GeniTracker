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
}