const supportingFileInput = document.getElementById("supporting-file-input");
const attachedFileContainer = document.querySelector(
  ".attached-files-container"
);
const memoImageFileInput = document.querySelector("#memo-image-input");
const memoImage = document.getElementById("memo-image-tag");
const btnSwapConfigureMemo = document.getElementById('btn-swap-configure-memo')

const selectedFiles = []; //keeps track of all supporting documents that has been chosen
const selectedMemoImage = null;
const acceptedFileExtension = [".docx", ".doc", ".pdf"];

function addToHistory(pageIndex=1, sectionId='configure-memo-section') {
  const stateObj = { 
    pageIndex: pageIndex,
    sectionId: sectionId 
  };
  history.pushState(stateObj, '', '/');
}

function selectProgressStep(number) {
  let found = false;
  const progresSteps = document.querySelectorAll(".progress-step");
  progresSteps.forEach(function (step) {
    const value = step.querySelector(".num")?.textContent;
    if (!found){
        step.classList.add('selected')
        
        if(value === String(number)){
            step.classList.remove('filled')
            found = true
        } 
        else{
          step.classList.add('filled')
        }
    }
    else{
        step.classList.remove('selected')
        step.classList.remove('filled')
    }

  });
}

selectProgressStep(1)


function swapSections(progressStep, newSectionId, addtoHistory=false){
    document.querySelectorAll(`.memo-section`).forEach(function(section){
        if (section.id == newSectionId){
            section.classList.add('visible')
        }
        else{
            section.classList.remove('visible')
        }
    })
    selectProgressStep(progressStep)
    window.scrollTo(0,0)

}



function getExtension(fileName) {
  return fileName.slice(fileName.indexOf("."), fileName.length);
}

function addFileIntoUi(file) {
  if (!acceptedFileExtension.includes(getExtension(file.name))) {
    showToast({
      message: "File must be a .docx, .doc, .pdf file",
      style: "error",
    });
    return;
  }
  const htmlEl = `
    <div class="attached-file" id="${file.name}">
    <p class="attached-file__name">${file.name}</p>
    <svg
      class="svg-20 remove-file"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path
        d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"
      ></path>
    </svg>
  </div>
    `;
  attachedFileContainer.insertAdjacentHTML("beforeend", htmlEl);
  selectedFiles.push(file);
}

function removeFileFromUi(fileName) {
  const index = selectedFiles.findIndex((file) => file.name === fileName);
  selectedFiles.slice(index, 1);

  document.getElementById(fileName).remove();
}

function displayImage(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    memoImage.src = e.target.result;
  };
  reader.readAsDataURL(file);
  selectedMemoImage = file;
}


window.addEventListener('popstate', function(event) {
  if(event.state?.pageIndex){
    swapSections(event.state.pageIndex, event.state.sectionId)
  }
  
});


document.querySelector('.audience-options-container').addEventListener('click', function(e){
    const audienceOption = e.target.closest('.audience-option')
    if(audienceOption){
        document.querySelectorAll('.audience-option').forEach(element => {
            element.classList.remove('selected')
        });

        audienceOption.classList.add('selected')
        console.log(audienceOption.getAttribute('data-value'))

    }
})

document.getElementById('btn-swap-choose-audience').addEventListener('click',function(){
    swapSections(3,'configure-memo-section')
})

btnSwapConfigureMemo.addEventListener('click', function(){
    addToHistory(1, 'configure-memo-section')//adding the current section to history so we can navigate back to it on back button pressed
    swapSections(2, 'choose-audience-section')
})

memoImageFileInput.addEventListener("change", function (e) {
  displayImage(memoImageFileInput.files[0]);
});

document.querySelector(".add-image-btn").addEventListener("click", function () {
  memoImageFileInput.click();
});

document
  .querySelector(".file-select-container")
  .addEventListener("click", function () {
    supportingFileInput.click();
  });

supportingFileInput.addEventListener("change", function (e) {
  Array.from(supportingFileInput.files).forEach(function (file) {
    addFileIntoUi(file);
  });
});

attachedFileContainer.addEventListener("click", function (e) {
  if (e.target.classList.contains("remove-file")) {
    removeFileFromUi(e.target.closest(".attached-file").id);
  }
});
