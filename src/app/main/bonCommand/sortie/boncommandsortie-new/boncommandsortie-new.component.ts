import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'; 
import { FileUploader } from 'ng2-file-upload'; 
import Swal from 'sweetalert2'; 
import { BoncommandsortieNewService } from './boncommandsortie-new.service'; 
 
interface Imported {
  codeDestinataire: String;
  transporteur: String;
  numeroCommande: String;
  dateCommande: Date;
  codeArticle: String;
  qteColis: String;
}

@Component({ 
  selector: 'app-boncommandsortie-new', 
  templateUrl: './boncommandsortie-new.component.html', 
  styleUrls: ['./boncommandsortie-new.component.scss'], 
  changeDetection: ChangeDetectionStrategy.OnPush 
}) 
export class BoncommandsortieNewComponent implements OnInit { 
 
  public contentHeader: object; 
 
  public hasBaseDropZoneOver: boolean = false; 
 
  public uploader: FileUploader = new FileUploader({}); 
 
  public progress = 0; 
  public uploaded = 0;

  private importedFiles: any[] = []; 
 
  constructor( 
    private _BcsNewService: BoncommandsortieNewService 
  ) {} 

  clearQueue() {
    this.progress = 0;
    this.importedFiles = [];
  }

  removeFromQueue(item) {
    this.importedFiles = this.importedFiles.filter(
      f => {
        return f._file.name != item._file.name
      }
    )
  }
 
  importTo() { 
    this.progress = 100;     
 
    let bcs = this.importedFiles.find( 
      el => {         
        return (el._file.name + '').startsWith('BC') 
      }  
    ); 
           
    this.addBcs(bcs); 
  } 
 
  async addBcs(bcs) {        
    let r = new FileReader(); 
    r.readAsText(bcs._file); 
    await new Promise(f => setTimeout(f, 1000)); 
          
    let result: Imported[] = await this.uploadHelper(r.result); 
    
    let bcsI = [...new Map(result.map(item => [item.numeroCommande, item])).values()];
    
    console.log(result);
    console.log(bcsI);
    
    let ok = await new Promise<any>(
      resolve =>      
      this._BcsNewService.importBcsToDB(bcsI).subscribe( 
        res => {
          console.log(res);
          resolve(true);
        },
        ({error}) => {
          this.progress = -1;
          let msg = error ? (error.error_message + "").split('Exception: ')[1] : 'erreur';
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: msg
          });
        }
      )
    );
       
    this._BcsNewService.importLigneBcsToDB(result).subscribe( 
      res => {
        Swal.fire({ 
          position: 'top-end', 
          icon: 'success', 
          title: 'Les bons de commandes sont ajoutées avec succès', 
          showConfirmButton: false, 
          timer: 1500 
        }); 
      },
      ({error}) => {
        this.progress = -1;
        let msg = (error.error_message + "").split('Exception: ')[1];
        this._BcsNewService.deleteImported().subscribe(
          res => {
            console.log(res);
          }
        );
        
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: msg
        });
      }
    ); 
  } 
    
  fileOverBase(e: any): void {    
    this.hasBaseDropZoneOver = e; 
  } 
 
  async uploadHelper(result): Promise<any[]> { 
    let csv: any = result; 
    let allTextLines = []; 
 
    allTextLines = csv.split(/\r|\n|\r/); 
 
    let headers = allTextLines[0].split(','); 
    let data = headers; 
    let tarr = []; 
 
    type Fields = { [key: string]: any}; 
 
    let bcs: Fields = {}; 
 
    for (let j = 0; j < headers.length; j++) { 
      let key = String(data[j]).charAt(0).toLowerCase() + String(data[j]).slice(1); 
       
      bcs[key] = '';  
      tarr.push(key); 
    }    
           
    let arrl = allTextLines.length; 
 
    let arrData: Fields[] = []; 
 
    let dumy = bcs; 
 
    for(let i = 1; i < arrl; i++){ 
      let row = allTextLines[i].split(','); 
       
      if (row != '' && row) {  
        Object.keys(row).forEach( 
          el => {                        
            dumy[tarr[el]] =tarr[el] == "dateCommande" ? row[el] = this.formatedDate(row[el]) : row[el]; 
            if (parseInt(el) === (row.length - 1)) {               
              arrData.push(dumy); 
              dumy = {};               
            } 
          } 
        ); 
      } 
    } 
     
    return arrData; 
  } 
 
  formatedDate(date) { 
    let day = String(date).split('/')[0]; 
    let month = String(date).split('/')[1]; 
    let year = String(date).split('/')[2]; 
 
    return year + '-' + month + '-' + day; 
  } 
 
  ngOnInit(): void { 
    this.contentHeader = { 
      headerTitle: 'Bon de commande sortie', 
      actionButton: false, 
      breadcrumb: { 
        type: '', 
        links: [ 
          { 
            name: 'Accueil', 
            isLink: true, 
            link: '/' 
          }, 
          { 
            name: 'Bcs', 
            isLink: true,
            link: '/bcs/list' 
          }, 
          { 
            name: 'Ajouter', 
            isLink: false 
          } 
        ] 
      } 
    }; 
    
    this.uploader.onAfterAddingFile = async(fileItem: any) => {  
      this.importedFiles.push(fileItem); 
    }; 
 
  } 
}