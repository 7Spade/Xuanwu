import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './features/layout/app.component.html',
  styleUrl: './features/layout/app.component.css'
})
export class App {
  protected readonly title = signal('Xuanwu');
}
