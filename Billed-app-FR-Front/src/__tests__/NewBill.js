/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import {fireEvent, screen} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"

// Navigation de l'utilisateur
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}

// Définition de l'utilisateur
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
window.localStorage.setItem('user', JSON.stringify({
  type: 'Employee'
}))

// Test de rendu de la page
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the NewBill page should be render", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    })
  })
})

// Test de l'image et du message d'erreur
 describe("When I am on NewBill Page", () => {
   describe("When I want to upload an image", () => {
     test("Then, it's not an image, it should display an error message", ()=> {

      document.body.innerHTML = NewBillUI()
      const newBill = new NewBill({
        document, onNavigate, store: mockStore
      })
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
      const inputFile = screen.getByTestId("file")
      inputFile.addEventListener("change", handleChangeFile)
      fireEvent.change(inputFile, 
        {
          target: {
          files: [new File(["test.pdf"], "test.pdf", {type: "image/pdf"})],
          }
        }
      )
      const error = screen.getByTestId("error")
      expect(error).toBeTruthy()
     })
   })
})

// Test de l'envoi d'un billet
describe("When I am on NewBill Page",() => {
  describe("When I Want send a new bill", () => {
    test("Then, new bill is well sent", async () => {

      document.body.innerHTML = NewBillUI()
      const newBill = new NewBill ({
        document, onNavigate
      })

      // Création d'un billet test
      const form = screen.getByTestId("form-new-bill")
      const testBill = {       
        type: " dépense test",
        name: "test bill",
        amount: "500",
        date: "2022-06-29",
        vat: 20,
        pct: 70,
        commentary:"commentaire test",
        fileUrl: "test.jpg",
        fileName: "test bill",
        status: "pending"
      }

    // On simule l'envoi du formulaire
    const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))

    // On envoi un billet test  
    newBill.create = (newBill) => newBill
    newBill.fileUrl = testBill.fileUrl
    newBill.fileName = testBill.fileName 
    newBill.status = testBill.status
    document.querySelector(`select[data-testid="expense-type"]`).value = testBill.type
    document.querySelector(`input[data-testid="expense-name"]`).value = testBill.name
    document.querySelector(`input[data-testid="amount"]`).value = testBill.amount
    document.querySelector(`input[data-testid="datepicker"]`).value = testBill.date
    document.querySelector(`input[data-testid="vat"]`).value = testBill.vat
    document.querySelector(`input[data-testid="pct"]`).value = testBill.pct
    document.querySelector(`textarea[data-testid="commentary"]`).value = testBill.commentary   
    form.addEventListener('click', handleSubmit)
    fireEvent.click(form)
    expect(handleSubmit).toHaveBeenCalled()
    })
  })
})

// Test d'intégration POST 
describe("Given I am a user connected as Employee", () => {
  describe("When I am on  NewBills Page", () => {
    test("fetches bills from mock API POST", async () => {
      document.body.innerHTML = NewBillUI()
      const spy = jest.spyOn(mockStore.bills(), "update")
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
      })
      const form = screen.getByTestId('form-new-bill') 
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      form.addEventListener('click', handleSubmit)
      fireEvent.click(form)
      expect(handleSubmit).toHaveBeenCalled()
      expect(spy).toHaveBeenCalled();
      const bills = screen.getByTestId('tbody') 
      expect(bills).toBeInTheDocument()    
    })
  })
})
