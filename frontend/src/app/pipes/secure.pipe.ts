import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { lastValueFrom } from 'rxjs';
import { TokenStorageService } from '../services/token-storage.service';
import { LoginService } from '../services/login.service';

@Pipe({
  name: 'secure'
})
export class SecurePipe implements PipeTransform {

  constructor(private loginService: LoginService,private http: HttpClient, private sanitizer: DomSanitizer, private tokenStorage: TokenStorageService) { }
  
  async transform(src: string): Promise<string> {
    if (src.indexOf(';base64,') > -1) {
        return src;
    }
    src = this.loginService.URL + src
    const token = this.tokenStorage.getToken();
    console.log(token)
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}`, 'Content-Type': 'image/*' });
    const imageBlob$ = this.http.get(src, { headers, responseType: 'blob' })
    const imageBlob = await lastValueFrom(imageBlob$)
    console.log(imageBlob)
    const reader = new FileReader();
    return new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(imageBlob);
    });
  }

}
