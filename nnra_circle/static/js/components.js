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


  function showAlert(containerId, message, tag, append=false){
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

  function removeToast(toastId) {
    const toast = document.getElementById(toastId);
    toast.style.transform = "translateY(-150%)";
  }