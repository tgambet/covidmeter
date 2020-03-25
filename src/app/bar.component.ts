import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-bar',
  template: `
    <svg height="15" #svg>
      <ng-container *ngFor="let point of displaySet; trackBy: trackByFn">
        <rect height="15" [attr.width]="point.length > 0 ? point.length : 0"
              [attr.fill]="point.color" attr.transform="translate({{point.offset}}, 0)"></rect>
      </ng-container>
    </svg>
  `,
  styles: [`
    svg {
      width: 100%;
    }
    rect {
      transition: width ease 300ms, transform ease 300ms;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BarComponent implements OnInit, OnChanges {

  @ViewChild('svg', {static: true})
  svg: ElementRef;

  @Input()
  dataSet: {value: number; color: string}[] = [];

  displaySet: {length: number; offset: number; color: string}[] = [];

  total = 0;
  length = 0;

  constructor(
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.update();
      this.cdr.markForCheck();
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // this.update();
    if (changes.dataSet) {
      this.update();
    }
  }

  @HostListener('window:resize')
  update() {
    this.length = this.svg.nativeElement.clientWidth;
    this.total = this.dataSet.reduce((r, point) => r + point.value, 0);
    let offset = 0;
    this.displaySet = this.dataSet.map(point => {
      const result = {
        length: this.total === 0 ? 0 : point.value * this.length / this.total,
        offset,
        color: point.color
      };
      offset += result.length;
      return result;
    });
  }

  trackByFn(index, item) {
    return item.color; // or item.id
  }

}
