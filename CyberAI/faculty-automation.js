let fs = require('fs');
let xlsx = require('node-xlsx');
let facultyfile = xlsx.parse('C:\\Users\\ujash\\Downloads\\Faculty.xlsx'); // parses a file
let researcherfile = xlsx.parse('C:\\Users\\ujash\\Downloads\\Researchers.xlsx'); // parses a file
let dirpath = 'C:\\Cyber-AI\\CyberAI\\assets\\images\\faculty\\';
let facultyList = [];
class faculty{
    constructor(firstName, lastName, title, school, department, researchInterest, email, contact, facultyLink, photo, facultyType){
        this.fullName = firstName + ' ' + lastName;
        this.lastName = lastName;
        this.title = (title !== undefined)? title : 'Professor';
        this.department = (department !== undefined)? department : 'Other Department';
        this.school = school;
        this.researchInterest = (researchInterest !== undefined)? researchInterest: 'N/A';
        this.email = (email !== undefined)? email : 'N/A';
        this.contact = (contact !== undefined)? contact : 'N/A';;
        this.facultyLink = facultyLink;
        this.facultyType = facultyType;
        this.photo = (typeof photo == 'undefined' || photo == '')? 'placeholder' : photo;
        let filepath = dirpath + this.photo + '.jpg';
        this.photo = fs.existsSync(filepath)? 'assets\\images\\faculty\\' + this.photo + '.jpg' : 'assets\\images\\placeholder.jpg';
        if(this.photo.includes('placeholder')){
            console.log(this.fullName);
        }
    }
}

facultyfile[0].data.forEach(element =>{
    if(undefined!== element[0] && !element[0].includes('Name'))
    {
        facultyList.push(new faculty(element[0], element[1], element[3], element[4], element[5], element[6], element[7], element[8], element[9], element[10], 'faculty'));
    }});

researcherfile[0].data.forEach(element =>{
    if(!element[0].includes('Name'))
    {
        facultyList.push(new faculty(element[0], element[1], element[3], element[4], element[5], element[6], element[7], element[8], element[9], element[10],'researcher'));
        
}});
fs.writeFileSync('C:\\Cyber-AI\\CyberAI\\data\\faculties.json', JSON.stringify(facultyList));