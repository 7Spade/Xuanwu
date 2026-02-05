import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './features/layout/app.component.html',
  styleUrl: './features/layout/app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  protected readonly title = signal('Xuanwu');
}
