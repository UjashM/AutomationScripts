let fs = require('fs');
let xlsx = require('node-xlsx');
let file = xlsx.parse('C:\\Users\\ujash\\Downloads\\COGR.xlsx'); // parses a file
let summaryGuidances = [];

class SummaryGuidance{
    constructor(agency, guidanceAnswerDescription, guidanceAnswers, guidanceComments, guidanceDocuments, guidanceLinks, FOASiteLink){
        let currentDate = '5/6/20';
        this.agency = agency;
        this.guidanceAnswerDescription = guidanceAnswerDescription;
        this.guidanceAnswers = guidanceAnswers;
        this.guidanceComments = (typeof(guidanceComments)!= 'undefined') ? guidanceComments : '';
        this.guidanceDocuments = guidanceDocuments;
        this.guidanceLinks = guidanceLinks;
        this.FOASiteLink = FOASiteLink;
        this.updateddate = currentDate;/*(currentDate.getMonth(currentDate)+1) + '/' + currentDate.getDate(currentDate)
        + '/' + currentDate.getFullYear(currentDate); 
        console.log(this.updateddate);*/
    }
}

function getGuidanceProperties(entry)
{
    let guidanceAnswerDescription = [];
    let guidanceAnswers = [];
    let guidanceLinks = [];
    let guidanceDocuments = [];
    for(let i = 1; i< 24; i=i+2)
    {
        guidanceAnswers.push(entry[i]);
        guidanceAnswerDescription.push(entry[i+1]);
    }
    for(let i = 24; i< 32; i = i + 2)
    {
        if(((typeof entry[i] != 'undefined') || (null!=entry[i]))  && (entry[i] != ''))
        {
            guidanceDocuments.push(entry[i]);
            guidanceLinks.push(entry[i+1]);   
        }
    }
    return [guidanceAnswerDescription, guidanceAnswers, guidanceDocuments,guidanceLinks];
}


file[0].data.forEach(entry =>{
    if((typeof entry[0] != 'undefined') && (!entry[0].includes('Agency Name')))
    {
        let guidanceProperties = getGuidanceProperties(entry)
        summaryGuidances.push(new SummaryGuidance(entry[0].trim(), guidanceProperties[0], guidanceProperties[1], entry[32], guidanceProperties[2], guidanceProperties[3], entry[23]));
    }
   });
fs.writeFileSync('C:\\COVID-19\\ujashm.github.io\\data\\summary-guidances.json', JSON.stringify(summaryGuidances));