import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DemoSwitcherComponent } from './shared/demo-switcher/demo-switcher.component';
import { QueueSimulationService } from './core/services/queue-simulation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DemoSwitcherComponent],
  template: `
    <app-demo-switcher />
    <div class="pt-9">
      <router-outlet />
    </div>
  `,
})
export class AppComponent implements OnInit {
  private sim = inject(QueueSimulationService);

  ngOnInit(): void {
    this.sim.start();
  }
}
