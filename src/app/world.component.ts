import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-world',
  template: `
    <app-overview>
      <a mat-raised-button [routerLink]="['/']" color="accent" class="back">
        <mat-icon>keyboard_arrow_left</mat-icon>
      </a>
      <span>World overview</span>
      <mat-icon>language</mat-icon>
    </app-overview>
    <app-timeline></app-timeline>
    <app-growth></app-growth>
  `,
  styles: [`
    :host {
      display: block;
      padding: 16px;
      width: 100%;
      box-sizing: border-box;
      max-width: 600px;
      margin: 0 auto;
    }

    .back {
      padding: 0 8px;
      min-width: initial;
      margin-left: -8px;
      margin-right: 12px;
    }

    mat-icon {
      margin-left: auto;
    }

    app-overview, app-timeline, app-growth {
      margin-bottom: 16px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorldComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
  }
}
