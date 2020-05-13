let fs = require('fs');
let xlsx = require('node-xlsx');
let file = xlsx.parse('C:\\Users\\ujash\\Downloads\\academic-programs.xlsx'); // parses a file
let programs = [];

function getCoreCourseList(courses){
    let courseElement = '';
    courses = courses.split(', ');
    courses.forEach(course =>{
        courseElement = courseElement + `<li>${course}</li>`;
    });
    let courseList = `<ul class = "sub-list">${courseElement}</ul>`;
    return courseList;
}

class program{
    constructor(theme, programLevel, college, department, degree, credits, coreCourses, link, description){
        this.theme = theme;
        this.programLevel = programLevel;
        this.college = college;
        this.department = (typeof department == 'undefined' || department == '')? 'N/A': department;
        this.degree = degree;
        this.credits = credits;
        this.coreCourses = getCoreCourseList(coreCourses);
        this.link = link;
        this.description = (null == description)? 'N/A': description;
    }
}

file[0].data.forEach(entry =>{
    if((typeof entry[0] != 'undefined') && (!entry[0].toString().includes('Order')))
    {
        programs.push(new program(entry[1], entry[3], entry[4], entry[5], entry[6], entry[7], entry[8], entry[9], entry[10]));
    }});
fs.writeFileSync('C:\\Cyber-AI\\CyberAI\\data\\programs.json', JSON.stringify(programs));