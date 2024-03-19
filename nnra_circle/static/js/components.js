/**Used to show one modal at a time by removing all existing modals and
 * dispying the required one
 * @param modalId the id of the modal to be displayed
 * modalId should be none if no modal should be shown i.e remove all modals
 */
function transitionModal(modalId, onCancel = function(){transitionModal('none')}) {
    const modalSections = document.querySelectorAll(".modal-section");
    modalSections.forEach(function (modalSection) {
      modalSection.classList.remove("visible");
    });
  
    if (modalId == "none") {
      //this means we dont want to show any modal
    } else {
      const displayModal = document.getElementById(modalId);
      if (displayModal !== null) {
        if(displayModal.classList.contains('visible')){
          displayModal.classList.remove('visible')
        }
        else{
          displayModal.classList.add('visible')
          displayModal.onclick = (e) =>{
            if(e.target.classList.contains('modal-section')){
                onCancel()
            }
          }
        }
      }
    }
  }


function showAlert(containerId, message, tag='success', append=false){
      const container = document.getElementById(containerId)
      const alertHtml = `
            <div class="alert ${tag}">
                    <i class="ri-message-3-line"></i>                    
                    <p>${message}</p>
            </div>
      `
      if(!append) container.innerHTML = ''
      container.insertAdjacentHTML('beforeend', alertHtml)
}



function showConfirmationModalOne({
  message, 
  onModalCancel= function(){}, 
  onModalContinue=function(){},
  pCancelText = 'CANCEL', 
  pContinueText = 'CONTINUE', 
  safe=false
}) {
  transitionModal('none')
  const modalSection = document.createElement('div')
  modalSection.classList.add('visible')
  modalSection.classList.add('modal-section')
  const htmmlEl = `
  <div class="modal-content confirmation-modal-one" >
    <p class="modal-message"> ${message}</p>
    <div class="bottom-actions">
          <p class="p-cancel">${pCancelText}</p>
          <p class="p-continue ${safe?'safe': ''}">${pContinueText}</p>
    </div>
  </div>
  </div>
  `

  modalSection.innerHTML = htmmlEl
  modalSection.querySelector('.p-cancel').onclick = onModalCancel
  modalSection.querySelector('.p-continue').onclick= onModalContinue
  document.body.appendChild(modalSection)
  return modalSection
} 

function showToast({
    message,
    duration = 5000,
    style = "success",
    onfinshed = function () {},
  }) {
    transitionModal("none"); //ensure that all modals are cleared before the toast shows
    document.querySelectorAll(".toast").forEach(function (toast) {
      toast.remove();
    });
    const toastDiv = document.createElement("div");
    toastDiv.classList.add("toast");
    toastDiv.classList.add(`${style}`);
    toastDiv.id = "dynamic-toast-div";
  
    const iTag =
      style === "success"
        ? '<i class="ri-checkbox-circle-fill"></i>'
        : '<i class="ri-error-warning-line"></i>';
  
    const toastContent = ` <div class="toast-content">
      <div class="toast-con ${style}">
          <div class="left">
              <div class="icon-con">
              ${iTag}
              </div>
              <div class="message-con">
                  <p>${message}</p>
              </div>
          </div>
          <div class="right">
              <i class="ri-close-line" id="remove-${toastDiv.id}"></i>
          </div>
      </div>
      <div class="progress-container">
          <progress id="dynamic-toast-progress" value="0" max="100"> 32% </progress>
      </div>
      </div>`;
  
    toastDiv.innerHTML = toastContent;
    document.body.appendChild(toastDiv);
    
  
    document.getElementById(`remove-${toastDiv.id}`).onclick = function () {
      removeToast(toastDiv.id);
    };
  
    setTimeout(() => {
      toastDiv.style.transform = "translateY(0)";
      const toastProgess = document.getElementById("dynamic-toast-progress");
      increamentTimePercent = duration / 100;
      const valueIncreamenter = setInterval(() => {
        toastProgess.value += 1;
        if (toastProgess.value >= toastProgess.max) {
          //toast time has ellapsed
          clearInterval(valueIncreamenter);
          removeToast(toastDiv.id);
          onfinshed();
        }
      }, increamentTimePercent);
    }, 10);
    return toastDiv;
}

function getcsrfToken() {
  return getCookie("csrftoken");
}

function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function removeToast(toastId) {
    const toast = document.getElementById(toastId);
    toast.style.transform = "translateY(-150%)";
}

function disableToggler(button){
  button.disabled=true
  console.log('button disabled')
}

function changeProfileHolderState(containerId, state){
  const container = document.getElementById(containerId)
  for(let i=0; i< container.children.length; i++){
    const child = container.children[i]
    
    if(window.innerWidth > 865){
      if(child.classList.contains(state)){
        child.style.display = 'flex'
      }
      else{
        child.style.display= 'none';
      }
    }
    else{
      const rightProfileContent = document.querySelector('.right-profile-content')
      if(child.classList.contains('profile') && state == 'profile'){
        rightProfileContent.classList.add('visible')
        child.style.display = 'flex'
      }
      else{
        child.style.display = 'none'
      }
    }
   
  }
  
}

function toggleContainerState(containerId, state){
    const container = document.getElementById(containerId)
    for(let i =0; i<container.children.length; i++){
      const child = container.children[i]
      if(child.classList.contains(state)){
        child.style.display = 'flex'
      }
      else{
        child.style.display = 'none'
      }
    }
}

function closeRightProfileContent(){
  const rightProfileContent = document.querySelector('.right-profile-content')
  rightProfileContent.classList.remove('visible')
}