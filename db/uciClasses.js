const db = require('./queries')

async function main() {
    const response = await fetch('https://api.peterportal.org/rest/v0/courses/all');
    const data = await response.json();
    const codes = data.map(i => {
        return { 
            id: i.id,
            classCode: i.department + " " + i.number,
            classDesc: i.description,
            className: i.title
        }
    })
    console.log(data[0])
    // let found = false
    // let newCodes = []
    // codes.forEach(i => {
    //     if (i.classCode == "UNI STU 110"){
    //         found = true
    //     }
    //     else{
    //         if (found && i.classCode != "UNI STU 13C"){
    //             newCodes.push(i)
    //         }
    //     }
    // });
    // // console.log(newCodes[0])
    // newCodes.forEach(i => {
    //     try{
    //         db.addClass(i.classCode, i.className, i.classDesc)
    //     }
    //     catch (error){
    //         console.log(i)
    //     }
    // })
}

main()