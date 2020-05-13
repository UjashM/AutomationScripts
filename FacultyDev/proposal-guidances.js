let fs = require('fs');
let xlsx = require('node-xlsx');
let file = xlsx.parse('C:\\Users\\ujash\\Downloads\\Faculty-Dev-SpreadSheet.xlsx'); // parses a file
let proposalGuidances = [];

class ProposalGuidance{
    constructor(agency, mainheader, subheader, title, link, staticText){
        let currentDate = '5/7/20';
        this.agency = agency;
        this.mainheader = mainheader;
        this.subheader = (subheader !== '' && typeof subheader != 'undefined' && null!= subheader)?subheader: '';
        this.link = (link !== '' && typeof link != 'undefined' && null!= link)?link:'';
        this.title = (title !== '' && typeof title != 'undefined' && null!= title)?title:'';
        this.staticText = (staticText !== '' && typeof staticText != 'undefined' && null!= staticText)?staticText:'';
        this.updateddate = currentDate;/*(currentDate.getMonth(currentDate)+1) + '/' + currentDate.getDate(currentDate)
        + '/' + currentDate.getFullYear(currentDate); 
        console.log(this.updateddate);*/
    }
}

function getDate(serial){
    let utc_days  = Math.floor(serial - 25569);
    let utc_value = utc_days * 86400;                                        
    let date_info = new Date(utc_value * 1000);
    return (parseInt(date_info.getMonth(),10) + 1) + '/' + (parseInt(date_info.getDate(),10) + 1) + '/' + date_info.getFullYear();//, 0, minutes, seconds);
}

file[0].data.forEach(entry =>{
    if((typeof entry[1] != 'undefined') && (!entry[1].includes('Federal')))
    {
        if(entry[5] !== '' && typeof entry[5] != 'undefined')
        {
            proposalGuidances.push(new ProposalGuidance(entry[1], entry[3], entry[4], entry[5], entry[6], entry[7]));
        }
    }
   });
fs.writeFileSync('C:\\FacultyDev\\data\\proposalGuidance.json', JSON.stringify(proposalGuidances));