import currCodeAndCountry from './currenciesCodeCountry.js'
// import computeData from './compute.js'

let currenciesApiData = []; 
let mainCurrenciesApiData = [];
let restCurrenciesApiData = [];
let mainCountriesCode = ['USD','CHF','UAH','GBP','EUR'];
let polandData = {currency: 'polski złoty', code: 'PLN', mid: 1, country: 'poland', src: 'https://countryflagsapi.com/png/poland'}
let currFullData;
const LOCAL_STORAGE_DATA = 'countryData'
const LOCAL_STORAGE_HOUR = 'hourData'
const d = new Date();
let hour = d.getHours();
const bottomRatesContainer = document.querySelector('.bottom_rates');
const countryChoose = document.querySelectorAll('.country_choose');
const countryList = document.querySelectorAll('.countryList')
const countryListMain = document.querySelectorAll('.countryList_main');
const countryListRest = document.querySelectorAll('.countryList_rest');
const inputRateSearch = document.querySelectorAll('.inputRateSearch');
const switchBTN = document.querySelector('.reverse_button')
const inputTop = document.querySelector('.input_top');
const inputBottom = document.querySelector('.input_bottom');
const inputsAll = document.querySelectorAll('.inputs')
const calculateBtn = document.querySelector('.btn_check')
let lastIndex = null;
let calcResultsDiv = document.querySelector('.calc_results')

const dataFirstIndex = {
    liValue: 'USD',
    liOldValue: 'USD',
    index: 0,
    inputValue: '',
    mid: 0
}

const dataSecondIndex = {
    liValue: 'PLN',
    liOldValue: 'PLN',
    index: 1,
    inputValue: 5000,
    mid: 0
}

const liArrayActiveFirst = {
    liElMainCode: '',
    liElRestCode: ''
}

const liArrayActiveSecond = {
    liElMainCode: '',
    liElRestCode: ''
}

window.addEventListener('DOMContentLoaded', init());

function init() {
    isLocalStorage();
}

function renderStuff() {
    filterMainCurrency()
    renderBottomRates()
    renderCountryList()
    timerGetRates()
    initListeners()
}

function isLocalStorage() {
    const storage = localStorage.getItem(LOCAL_STORAGE_DATA);
    const timeStorage = JSON.parse(localStorage.getItem(LOCAL_STORAGE_HOUR))

    // is local storage
    if(storage && timeStorage == hour) {
        currenciesApiData = JSON.parse(storage)
        currFullData = currenciesApiData
        renderStuff();
    

    } else {
        getData()

    }
}



function getData() {
    fetch(
        `http://api.nbp.pl/api/exchangerates/tables/a/`
        )
    .then(resp => resp.json())
    .then(data => {
        currenciesApiData = data[0].rates
            currenciesApiData.push(polandData)
            connectData()

            localStorage.setItem(LOCAL_STORAGE_DATA, JSON.stringify(currFullData))
            localStorage.setItem(LOCAL_STORAGE_HOUR, JSON.stringify(hour))
            renderStuff()
    });
}

function connectData() {
    currFullData = currenciesApiData

    currFullData.forEach( el =>{
        currCodeAndCountry.forEach((elSM, index) => {
            if(el.code == elSM.code) {
                currFullData[index].country = currCodeAndCountry[index].country.toLowerCase()
                currFullData[index].src = `https://countryflagsapi.com/png/${currFullData[index].country}`
            }
        })
    })
}

function filterMainCurrency() {
    currenciesApiData.forEach(el => {
        if(mainCountriesCode.includes(el.code)) {
            mainCurrenciesApiData.push(el)
        }
    })

    currenciesApiData.forEach(el => {
        if(!mainCountriesCode.includes(el.code)) {
            restCurrenciesApiData.push(el)
        }
    })
}


function initListeners() {
    countryChooseBtn()
    countryInputFilter()
    switchBtnListener()

    inputsValueListener()
    calculateListener()
}

function calculateListener() {


    calculateBtn.addEventListener('click', () => {
        dataFirstIndex.mid = getCurrMid(dataFirstIndex.liValue)
        dataSecondIndex.mid = getCurrMid(dataSecondIndex.liValue)
        // góra czy doł = otrzymał czy zapłaci, waluty góra dół kurs waluty góra dół, kwota góra dół
        computeData(dataFirstIndex.inputValue, dataSecondIndex.inputValue, 
            dataFirstIndex.liValue, dataSecondIndex.liValue, dataFirstIndex.mid, dataSecondIndex.mid)
    })
}

function inputsValueListener() {
    inputsAll.forEach(el => el.addEventListener('keyup', (e)=> {
    
        calcResultsDiv.innerHTML = ''

        if(e.target.id === 'top_input') {
            inputBottom.value = ''
            dataSecondIndex.inputValue = ''

            dataFirstIndex.inputValue = e.target.value
        }
        if(e.target.id === 'bottom_input') {
            inputTop.value = ''
            dataFirstIndex.inputValue = ''

            dataSecondIndex.inputValue = e.target.value
        }
    } ))
}


function switchBtnListener() {
    switchBTN.addEventListener('click', () => {
        addOldValue()

        switchValues()
        switchInputValues()
    })
}

function switchInputValues() {
    let dataOne, dataTwo, valueOne, ValueTwo

    dataOne = dataFirstIndex.inputValue
    dataTwo = dataSecondIndex.inputValue

    dataFirstIndex.inputValue = dataTwo
    dataSecondIndex.inputValue = dataOne

    inputTop.value = dataTwo
    inputBottom.value = dataOne
}

function clearCurrencyInput() {
    inputRateSearch.forEach(el => el.value = '');
    renderCountryList()
}

function addOldValue() {
    dataFirstIndex.liOldValue = dataFirstIndex.liValue;
    dataSecondIndex.liOldValue = dataSecondIndex.liValue;
}


function countryChooseBtn()
{
        document.addEventListener('click', e => {

            let ul = e.target.closest('ul')  
            let li = e.target.closest('li')          
            let divTarget = e.target.closest('.country_choose')

            if(e.target.classList.contains('inputRateSearch')) return
            clearCurrencyInput();

            if(divTarget) {
                let dataSetDivTarget = divTarget.dataset.index
                countryChooseClickIndex(dataSetDivTarget)
                renderActiveLiClass(dataSetDivTarget)
            }

            if(li) {
                addOldValue()
                cuntryChooseClickLi(li)
                let whichArr = ul.classList.contains('countryList_main') ? 'main' : 'rest'  // która lista
                let whichInput = lastIndex // który input
                let liCode = li.dataset.code
                setActiveToArray(whichInput, whichArr, liCode)
            }
            
            if(divTarget) {
                let indexTarget = divTarget.dataset.index

                if(!countryList[indexTarget].classList.contains('isVisible')) {

                    countryList.forEach(el => {
                        el.classList.remove('isVisible')
                    })
                    countryList[indexTarget].classList.add('isVisible')
                } else {
                    countryList.forEach(el => {
                        el.classList.remove('isVisible')
                    })
                }

            } else { 
                countryList.forEach(el => {
                    el.classList.remove('isVisible')
                })
            }   
        })
}

function setActiveToArray(upDown, mainRest, liCode) {

    let activeArrays = [liArrayActiveFirst,liArrayActiveSecond];
    if(upDown == 0) {
        if(mainRest == 'main') {
            activeArrays[upDown].liElMainCode = liCode
        }   

        if(mainRest !== 'main') {
            activeArrays[upDown].liElRestCode = liCode
        }
    } 

    if(upDown == 1) {
        if(mainRest == 'main') {
            activeArrays[upDown].liElMainCode = liCode
        }

        if(mainRest !== 'main') {
            activeArrays[upDown].liElRestCode = liCode
        }
    }
}

function resetActiveClass(upDown) {
    if(upDown == 0) {
        liArrayActiveFirst.liElMainCode = ''
        liArrayActiveFirst.liElRestCode = ''
    }
    if (upDown == 1) {
        liArrayActiveSecond.liElMainCode = ''
        liArrayActiveSecond.liElRestCode = ''
    }
}

function addQuerySelectorsToLi(upDown, mainRest) {
    let activeArrays = [liArrayActiveFirst,liArrayActiveSecond];

    if(upDown == 0) {
        if(mainRest == 'main') {
            activeArrays[upDown].liQueryMain = [...document.querySelectorAll('.countryList_main')[0].querySelectorAll('li')]
        }

        if(mainRest == 'rest') {
            activeArrays[upDown].liQueryRest = [...document.querySelectorAll('.countryList_rest')[0].querySelectorAll('li')]
        }
    }

    if(upDown == 1) {
        if(mainRest == 'main') {
            activeArrays[upDown].liQueryMain = [...document.querySelectorAll('.countryList_main')[1].querySelectorAll('li')]
        }

        if(mainRest == 'rest') {
            activeArrays[upDown].liQueryRest = [...document.querySelectorAll('.countryList_rest')[1].querySelectorAll('li')]
        }
    }
}

function renderActiveLiClass(upDownIndex) {
    let activeArrays = [liArrayActiveFirst,liArrayActiveSecond];

    let mainLi = activeArrays[upDownIndex].liElMainCode
    let restLi = activeArrays[upDownIndex].liElRestCode
    let activeClass

    if(mainLi !== '' || restLi !== '') {
        if(mainLi !== '') {
            addQuerySelectorsToLi(upDownIndex, 'main')
            activeClass = activeArrays[upDownIndex].liQueryMain.filter(el => el.dataset.code == activeArrays[upDownIndex].liElMainCode)
            if(activeClass) activeClass[0].classList.add('active')
            resetActiveClass(upDownIndex)
        }

        if(restLi !== '') {
            addQuerySelectorsToLi(upDownIndex, 'rest')
            activeClass = activeArrays[upDownIndex].liQueryRest.filter(el => el.dataset.code == activeArrays[upDownIndex].liElRestCode)
            if(activeClass) activeClass[0].classList.add('active')
            resetActiveClass(upDownIndex)
        }
    }
}

function cuntryChooseClickLi(li) {
    let curValue = li.querySelector('.countryList__countryName--shortName').innerHTML

    if(lastIndex == 0) {
        dataFirstIndex.liValue = curValue;

    } else {
        dataSecondIndex.liValue = curValue;
    }

    if(dataFirstIndex.liValue !== dataSecondIndex.liValue) {
        renderInputCountry(lastIndex)
    } else {
        switchValues()
    }
}

function getCurrMid(value) {
    let curMid = currFullData.filter(el => el.code == value)[0].mid
    return curMid
}

function renderInputCountry(indexNumb) {

    let dataIndexAll = [dataFirstIndex, dataSecondIndex]
    let code = dataIndexAll[indexNumb].liValue
    let countryData = currFullData.filter( el => {
        return el.code === code
    })
    let country = countryData[0]

    countryChoose[indexNumb].innerHTML = `

             <div class="country_choose--flag">
                 <img class="inputIMG topIMG" src="https://countryflagsapi.com/png/${country.country}" alt="${country.country} flag">
                 <h3 class="top">${country.code.toUpperCase()}</h3>
            </div>
           <i class="fa-solid fa-chevron-down"></i>
    `
}

function switchValues() {
    switchCountryPart()
    renderInputCountry(0)
    renderInputCountry(1)
}

function switchCountryPart() {
    dataFirstIndex.liValue = dataSecondIndex.liOldValue
    dataSecondIndex.liValue = dataFirstIndex.liOldValue
}

function countryChooseClickIndex(index) {
    lastIndex = index
}

function countryInputFilter() {
    inputRateSearch.forEach( input => {
        input.addEventListener('keyup', e =>{
            let letter = input.value;

            let renderedMainArray = mainCurrenciesApiData.filter( e => {
                return e.currency.includes(letter)
            })

            let renderedRestArray = restCurrenciesApiData.filter( e => {
                return e.currency.includes(letter)
            })
            renderMainCountryList(renderedMainArray)
            renderRestCountryList(renderedRestArray)
        })
    })
}

function renderCountryList() {
    renderMainCountryList();
    renderRestCountryList();
}

function renderMainCountryList(defaultArr = mainCurrenciesApiData) {
    countryListMain.forEach( (el, index)  => {
        countryListMain[index].innerHTML = ' '

        defaultArr.forEach( (liElement, indexS) => {
            let liEl= `            
            <li data-index="${indexS}" data-code="${liElement.code}">
                <img class="countryList__subtitles_img" src="${liElement.src}" alt="${liElement.country} flag">

                <div class="countryList__countryName">
                    <span class="countryList__countryName--shortName">${liElement.code}</span>

                    <span class="countryList__countryName--rateName">${liElement.currency}</span>
                </div>
            </li> 
            `        

            countryListMain[index].innerHTML += liEl
        })
    })
}

function renderRestCountryList(defaultArr = restCurrenciesApiData) {
    countryListRest.forEach( (el, index)  => {
        countryListRest[index].innerHTML = ' '

        defaultArr.forEach( (liElement, indexS) => {
            let liEl= `            
            <li data-index="${indexS}"  data-code="${liElement.code}">
                <img class="countryList__subtitles_img" src="${liElement.src}" alt="${liElement.country} flag">

                <div class="countryList__countryName">
                    <span class="countryList__countryName--shortName">${liElement.code}</span>

                    <span class="countryList__countryName--rateName">${liElement.currency}</span>
                </div>
            </li> 
            `
            countryListRest[index].innerHTML += liEl
        })
    })
}

function renderBottomRates() {
    mainCurrenciesApiData.forEach(el => {
        let liEl = `
        <div class="single__rates">
        <img src="https://countryflagsapi.com/png/${el.country}" alt="${el.country} flag">
        <div class="single__rates--country">
            <h3>${el.code}</h3>
            <p>${el.mid}</p>
        </div>
    </div>
        `
        bottomRatesContainer.innerHTML += liEl;
    })
}

function timerGetRates() {
    setInterval(() => {
        window.location.reload()
    }, 3600000);
}

function computeData(upInputValue, downInputValue, upCountry, downCountry, upMid, downMid) {
    let resultCompute = undefined 
    let isUpInput = upInputValue == '' ? false : true;
    
    if(upInputValue != '') {
        resultCompute = (upInputValue * upMid / downMid).toFixed(2)
    }

    if(upInputValue == '') {
        resultCompute =(downInputValue * downMid / upMid).toFixed(2)
    }

    let renderDataUp = `
    <div class="upperRate">1 ${downCountry} = ${(downMid / upMid).toFixed(4)} ${upCountry}</div>
    <div class="bottomRate"> 1 ${upCountry} = ${(upMid / downMid).toFixed(4)} ${downCountry}</div>
    <div class="rateforNumber"> Za ${upInputValue} ${upCountry} otrzymasz ${resultCompute} ${downCountry}</div>
    `
    let renderDataDown = `
    <div class="upperRate">1 ${upCountry} = ${(upMid / downMid).toFixed(4)} ${downCountry}</div>
    <div class="bottomRate"> 1 ${downCountry} = ${(downMid / upMid).toFixed(4)} ${upCountry}</div>
    <div class="rateforNumber"> Za ${downInputValue} ${upCountry} zapłacisz ${resultCompute} ${downCountry}</div>
    `
    calcResultsDiv.innerHTML = isUpInput ? renderDataUp : renderDataDown;
}