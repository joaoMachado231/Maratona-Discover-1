const Modal = {
    open(){
        // Abrir modal
        // Adicionar a class active ao modal
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active')

    },
    close(){
        // Fechar o modal
        // removar a class active do modal
        document
            .querySelector('.modal-overlay')
            .classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

//não são 50000 e sim 500 reais, isso é pra uma forma de tratamento com dinheiro


// Eu preciso somar as entradas, depois somar as saídas e remover das entradas e então terei o total de tudo

const Transaction = {

    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes () {
        let income = 0;
        // pegar todas as transações
        // para cada transação
        Transaction.all.forEach(transaction => {
            // se ela for maior que zero
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
            // somar a uma variavel e retornar a variavel
        })
        return income;
    },

    expenses () {
        let expense = 0;
        // pegar todas as transações
        // para cada transação
        Transaction.all.forEach(transaction => {
            // se ela for maior que zero
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
            // somar a uma variavel e retornar a variavel
        })
        return expense;
    },

    total () {
        return Transaction.incomes() + Transaction.expenses();
    }

}

// Substituir os dados do HTML com os dados do JS
// Eu preciso pegar as minhas transações do meu objeto aqui do JavaScript e colocar no HTML

const DOM = {
    transactionContainer: document.querySelector('#data-table tbody'),

    addTransaction (transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {

        const CSSclass = transaction.amount > 0 ? "income" : "expense"

         const amount = Utils.formatCurrency(transaction.amount)

        const html = 
        `
            <td class="description">${transaction.description}</td> 
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
        `

        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionContainer.innerHTML = ""
    }
}


const Utils = {
    formatAmount(value) {
        value = value * 100
        
        return Math.round(value)
    },

    formatDate(date){
        const splittedDate = date.split("-")
        
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        }) 


        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues()

        if(description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos")
        }
        console.log(Form.getValues())
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }

    },

    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        // verificar se todas as informações foram preenchidas

        try {
            Form.validateFields()
            // formatar os dados para salvar 
            const transaction = Form.formatValues()
            //salvar
            Form.saveTransaction(transaction)
            // apagar os dados do formulário
            Form.clearFields()
            // modal feche
            Modal.close()
            // Ataulizar a aplicação
            
        } catch (error) {
            alert(error.message)
        }

    }
}


const App = {
    init() {

        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })
        
        DOM.updateBalance()
        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()

/*
Transaction.add({
    description: 'Alo',
    amount: 200,
    date: '07/02/2021',
})
*/