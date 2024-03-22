const supportingFileInput= document.getElementById('supporting-file-input')

const selectedFiles = [] //keeps track of all supporting documents that has been chosen

document.querySelector('.file-select-container').addEventListener('click',function(){
    supportingFileInput.click()
})

supportingFileInput.addEventListener('change', function(e){
    console.log('changed')
})