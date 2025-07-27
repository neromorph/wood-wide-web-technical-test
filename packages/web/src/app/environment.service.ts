import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  public get backendUrl(): string {
    return (window as any).env.backendUrl;
  }
}
