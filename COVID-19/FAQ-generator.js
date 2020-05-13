let fs = require('fs');
let xlsx = require('node-xlsx');
let file = xlsx.parse('C:\\Users\\ujash\\Downloads\\FAQ-COVID-19.xlsx'); // parses a file
let questions = [];

class question{
    constructor(questionType, question, answer){
        this.questionType = questionType;
        this.question = question;
        this.answer = answer;
    }
}
let allowentry = false;
file[0].data.forEach(entry =>{
    if(allowentry && (typeof entry[1] != 'undefined'))
    {
        questions.push(new question(entry[0], entry[1], entry[2]));
    }
    if(typeof entry[0] != 'undefined'  && entry[0].includes('VPR'))
    {
        allowentry = true;
    }});
fs.writeFileSync('C:\\COVID-19\\ujashm.github.io\\data\\questions.json', JSON.stringify(questions));