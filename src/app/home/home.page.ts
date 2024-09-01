import { Component, OnInit } from '@angular/core';
import { HomeService } from './service/home.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  lista: any[] =[];

  constructor(private service: HomeService) {}
  ngOnInit(): void {
    this.getList();
  }

  async getList(): Promise<void>{
    await this.service.getAll().subscribe(
      value => {
        this.lista = value;
        console.log(this.lista);
        
  })
  }


}
