import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-stat-rupture',
  templateUrl: './stat-rupture.component.html',
  styleUrls: ['./stat-rupture.component.scss']
})
export class StatRuptureComponent implements OnInit {
  @Input() data;

  constructor() { 
    console.log(this.data);
    
  }

  ngOnInit(): void {
  }

}
