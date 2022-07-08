/**
 * @jest-environment jsdom
 */
 import '@testing-library/jest-dom';
 import userEvent from "@testing-library/user-event";
import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import { bills } from "../fixtures/bills"
import router from "../app/Router"


// Navigation de l'utilisateur
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}

// Définition de l'utilisateur
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
window.localStorage.setItem('user', JSON.stringify({
  type: 'Employee'
}))

jest.mock("../app/Store", () => mockStore)

// Test d'affichage de la page
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    // Test de la modale au clic du bouton
    test("Then button eye is clicked, I should see modal with current bill", () =>{
      document.body.innerHTML = BillsUI({ data: bills })
      const newBills = new Bills ({
        document,
      })
      $.fn.modal = jest.fn();
      const handleClickIconEye = jest.fn((e) => newBills.handleClickIconEye(eye[0]));
      const icon = screen.getAllByTestId("icon-eye");     
            icon[0].addEventListener("click", handleClickIconEye);     
      userEvent.click(icon[0]);
      expect(handleClickIconEye).toHaveBeenCalled();
      expect(screen.getByText('Justificatif')).toBeInTheDocument();
    })   
  })
 })

  // Test ajout de la nouvelle note de frais
  describe("Given I am connected as an employee", () => {
    describe('When I am on Bills Page and I click on the getNewBill btn', ()=>{
      test("Then it should render form to new bill ", async() =>{      
        await waitFor(() => screen.getByText("Nouvelle note de frais"))
        document.body.innerHTML = BillsUI({ data: bills })              
        const newBills = new Bills ({
          document,
          onNavigate,
        })       
        const btnNewBill = screen.getByTestId('btn-new-bill')
        const handleClickNewBill = jest.fn(newBills.handleClickNewBill);
        btnNewBill.addEventListener('click',handleClickNewBill)
        userEvent.click(btnNewBill);
        expect(handleClickNewBill).toHaveBeenCalled();
        expect(screen.getByTestId("form-new-bill")).toBeInTheDocument()      
      })
    })
  })

// Test d'integration Get
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills Page", () => {
      test("fetches bills from mock API GET", async () => {
        localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
        await waitFor(() => screen.getByText("Mes notes de frais"))
        const title =  screen.getByText("Mes notes de frais")
        expect(title).toBeInTheDocument()
        const billsArray = await screen.getByTestId("tbody")
        expect(billsArray).toBeInTheDocument()      
      })
    describe("When an error occurs on API", () => {
        beforeEach(() => {
          jest.spyOn(mockStore, "bills")
          Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
          )
          window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee',
            email: "a@a"
          }))
          const root = document.createElement("div")
          root.setAttribute("id", "root")
          document.body.appendChild(root)
          router()
        })
        test("fetches bills from an API and fails with 404 message error", async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
              }
            }
          })
          window.onNavigate(ROUTES_PATH.Bills)
          await new Promise(process.nextTick);
          const message = await screen.getByText(/Erreur 404/)
          expect(message).toBeTruthy()
        })

        test("fetches messages from an API and fails with 500 message error", async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list : () =>  {
                return Promise.reject(new Error("Erreur 500"))
              }
            }
          })
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})