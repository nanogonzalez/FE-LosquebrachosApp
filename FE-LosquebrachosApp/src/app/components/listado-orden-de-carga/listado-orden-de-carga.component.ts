import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { ConfirmBoxService } from 'src/app/services/confirm-box.service';
import { OrdenDeCargaService } from 'src/app/services/orden-de-carga.service';
import { OrdenDeCargaDataSource } from 'src/app/data-sources/ordenDeCargaDataSource';
import { debounceTime, distinctUntilChanged, fromEvent, tap, merge } from 'rxjs';



@Component({
  selector: 'app-listado-orden-de-carga',
  templateUrl: './listado-orden-de-carga.component.html',
  styleUrls: ['./listado-orden-de-carga.component.css']
})
export class ListadoOrdenDeCargaComponent implements OnInit, AfterViewInit{



  displayedColumns: string[] = ['numeroOrden', 'cliente', 'destinoDeCarga', 'destinoDeDescarga','distanciaViaje', 'diaHoraCarga', 'tipoMercaderia', 'acciones'];
  dataSource: OrdenDeCargaDataSource;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('input') input: ElementRef;

  
  constructor(private _snackBar: MatSnackBar, private _ordenDeCargaService: OrdenDeCargaService, private _dialogService: ConfirmBoxService) { }

  
  ngOnInit(): void {
   this.dataSource = new OrdenDeCargaDataSource(this._ordenDeCargaService);
   this.dataSource.loadOrdenDeCarga('', 'asc', 1, 10);
  }


  ngAfterViewInit() {
    this.paginator._intl.itemsPerPageLabel= "Items por página";
    fromEvent(this.input.nativeElement,'keyup')
            .pipe(
                debounceTime(150),
                distinctUntilChanged(),
                tap(() => {
                    this.paginator.pageIndex = 0;
                    this.loadOrdenDeCargaPage();
                })
            )
            .subscribe();

    this.sort.sortChange.subscribe(()=> this.paginator.pageIndex = 1);

    merge(this.sort.sortChange, this.paginator.page)
    .pipe(
      tap(() => this.loadOrdenDeCargaPage())
    )
    .subscribe();
  }

  loadOrdenDeCargaPage(){
    const page = this.paginator.pageIndex + 1;
    this.dataSource.loadOrdenDeCarga(
      this.input.nativeElement.value,
      this.sort.direction,
      page,
      this.paginator.pageSize
    );
  }

  eliminarOrdenDeCarga(id: number){
  
     this._dialogService.openConfirmDialog('Pedido De Carga')
     .afterClosed().subscribe(res=>{
      if(res){
        this._ordenDeCargaService.deleteOrdenDeCarga(id).subscribe(()=>{
          this.mensajeExito();
          this.loadOrdenDeCargaPage();
          })
      }
     })
  }

  mensajeExito(){
    this._snackBar.open('EL Pedido de Carga fue eliminado con éxito!', '' ,{
      duration: 2000,
      horizontalPosition: 'left'
   });
  }

}  


