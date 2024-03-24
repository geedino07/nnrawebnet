const supportingFileInput = document.getElementById("supporting-file-input");
const attachedFileContainer = document.querySelector(
  ".attached-files-container"
);
const memoImageFileInput = document.querySelector("#memo-image-input");
const memoImage = document.getElementById("memo-image-tag");
const btnSwapConfigureMemo = document.getElementById("btn-swap-configure-memo");
const selectedDeptContainers = document.getElementById(
  "selected-dept-containers"
);
const memoTitleInput = document.getElementById("memo-title");
const memoBodyInput = document.getElementById("memo-body");

const selectedFiles = []; //keeps track of all supporting documents that has been chosen
let selectedMemoImage = null;
let selectedDepartments = [];
const acceptedFileExtension = [".docx", ".doc", ".pdf"];
let selectedAudience = null;

function submitMemo(memoTitle, memoBody) {
  showDynamicLoadingModal("Building memo...");

  const formData = new FormData();
  formData.append("memo-title", memoTitle);
  formData.append("memo-body", memoBody);
  formData.append("memo-image", selectedMemoImage);
  formData.append("selected-audience", selectedAudience);
  formData.append("selected-departments", JSON.stringify(selectedDepartments));

  for (const file of selectedFiles) {
    formData.append("files", file);
    console.log(file)
  }

  fetch("/memo/create/", {
    method: "POST",
    headers: {
      "X-CSRFToken": getcsrfToken(),
    },
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    });
}

function getParam(paramName) {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has(paramName)) {
    const paramValue = urlParams.get(paramName);
    return paramValue;
  }

  return null;
}

function addToHistory(pageIndex = 1, sectionId = "configure-memo-section") {
  try {
    history.pushState(
      {
        pageIndex: pageIndex,
        sectionId: sectionId,
      },
      sectionId,
      `/memo/create/?section=${sectionId}&pid=${pageIndex}`
    );
  } catch (error) {
    console.error(error);
  }
}

function selectProgressStep(number) {
  let found = false;
  const progresSteps = document.querySelectorAll(".progress-step");
  progresSteps.forEach(function (step) {
    const value = step.querySelector(".num")?.textContent;
    if (!found) {
      step.classList.add("selected");

      if (value === String(number)) {
        step.classList.remove("filled");
        found = true;
      } else {
        step.classList.add("filled");
      }
    } else {
      step.classList.remove("selected");
      step.classList.remove("filled");
    }
  });
}

selectProgressStep(1);

swapSections(3, 'memo-individuals-section')

function swapSections(progressStep, newSectionId, addHistory = false) {
  document.querySelectorAll(`.memo-section`).forEach(function (section) {
    if (section.id == newSectionId) {
      section.classList.add("visible");
    } else {
      section.classList.remove("visible");
    }
  });
  selectProgressStep(progressStep);
  window.scrollTo(0, 0);

  if (addHistory) addToHistory(progressStep, newSectionId);
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
  selectedFiles.splice(index, 1);

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

function addDepartmentUi(officename, officeid) {
  const htmlEl = `
  <div class="selected-item" id="${officeid}">
            <p class="selecte-item__name">${officename}</p>
            <svg
              class="svg-20 remove-selected"
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

  selectedDeptContainers.insertAdjacentHTML("beforeend", htmlEl);
}

window.addEventListener("popstate", function (event) {
  const sectionId = getParam("section");
  const pageIndex = getParam("pid");
  if (sectionId && pageIndex) {
    console.log(sectionId, pageIndex);
    swapSections(pageIndex, sectionId);
  }
});

selectedDeptContainers.addEventListener("click", function (e) {
  if (e.target.classList.contains("remove-selected")) {
    const selectedItem = e.target.closest(".selected-item");
    document.querySelector(`.check-${selectedItem.id}`).checked = false;
    selectedItem.remove();
    selectedDepartments.splice(
      selectedDepartments.indexOf(String(selectedItem.id)),
      1
    );
  }
});

document
  .getElementById("btn-add-department")
  .addEventListener("click", function () {
    transitionModal("select-dept-modal");
  });

document.getElementById('submit-memo-btn').addEventListener('click', function(){
  submitMemo(memoTitleInput.value, memoBodyInput.value)
})

document
  .getElementById("btn-apply-checked-departments")
  .addEventListener("click", function (e) {
    selectedDeptContainers.innerHTML = "";
    selectedDepartments = [];
    const checkedDepartments = document.getElementsByName("checkdepartment");
    checkedDepartments.forEach((checkedDepartment) => {
      if (checkedDepartment.checked) {
        addDepartmentUi(
          checkedDepartment.getAttribute("data-officename"),
          checkedDepartment.getAttribute("data-officeid")
        );
        selectedDepartments.push(
          checkedDepartment.getAttribute("data-officeid")
        );
      }
    });
    transitionModal("none");
  });

document
  .querySelector(".audience-options-container")
  .addEventListener("click", function (e) {
    const audienceOption = e.target.closest(".audience-option");
    if (audienceOption) {
      document.querySelectorAll(".audience-option").forEach((element) => {
        element.classList.remove("selected");
      });

      audienceOption.classList.add("selected");
      selectedAudience = audienceOption.getAttribute("data-value");
    }
  });

document
  .getElementById("btn-swap-choose-audience")
  .addEventListener("click", function () {
    if (selectedAudience) {
      swapSections(3, selectedAudience, true);
    }
  });

btnSwapConfigureMemo.addEventListener("click", function () {
  const memoTitle = document.getElementById("memo-title").value;
  const memoBody = document.getElementById("memo-body").value;
  if (memoTitle == "" || memoBody == "") {
    showToast({
      message: "A memo title and body is required",
      style: "error",
    });
    return;
  }

  swapSections(2, "choose-audience-section", true);
});

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
