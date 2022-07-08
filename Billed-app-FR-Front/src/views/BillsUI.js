import VerticalLayout from './VerticalLayout.js'
import ErrorPage from "./ErrorPage.js"
import LoadingPage from "./LoadingPage.js"
import Actions from './Actions.js'

const row = (bill) => {
  return (`
    <tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
      <td>${bill.formatedDate ?? bill.date}</td>   
      <td>${bill.amount} €</td>
      <td>${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)}
      </td>
    </tr>
    `)
  }
// Correction pour l'affichage par ordre décroissant des billets
const rows = (data) => {
  return (data && data.length) ? data.sort((a,b) => {if(b.date > a.date){
    return -1;
  }}).map(bill => row(bill)).join("") : ""
}
// Fin correction

export default ({ data: bills, loading, error }) => {
  
  const modal = () => (`
    <div class="modal fade" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `)

  if (loading) {
    return LoadingPage()
  } else if (error) {
    return ErrorPage(error)
  }

   // Fix bug 
   let sortBills;
   if(bills){
   const sortByMapped = (map,compareFn) => (a,b) => -compareFn(map(a),map(b));
   const toDate = e => new Date(e.date);
   const byValue = (a, b) => b-a;
   const byDate = sortByMapped(toDate, byValue);
   sortBills = [...bills].sort(byDate);
   console.log(sortBills);
   }
/* code inutile */

  // Bug de l'affichage par date des billets
  // let billsByDate;

  // if(bills){ 
  //   billsByDate = bills.sort(function(a,b){
  //     let c = new Date(a.date);
  //     let d = new Date(b.date);
  //     return d - c;
  //   });
  // }
   

  return (`
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(sortBills)}
          </tbody>
          </table>
        </div>
      </div>
      ${modal()}
    </div>`
  )
}