const searchInput = document.querySelector(".search-input");
const departmentsContainer = document.querySelector(".departments-container");
const btnContinue = document.getElementById('btn-continue')
let selectedDepartment = null
const userId = document.getElementById('uid').value
class Office {
  constructor(officeName, departmentName) {
    this.officeName = officeName;
    this.departmentName = departmentName;
  }
}

const officeList = [];
const departmentItems = document.querySelectorAll(".department-item");

departmentItems.forEach(function (departmentItem) {
  const officeName = departmentItem.getAttribute("data-office_name");
  const departmentName = departmentItem.getAttribute("data-dept_name");
  officeList.push(new Office(officeName, departmentName));
});

searchInput.addEventListener("input", function (text) {
  searchValue = searchInput.value;
  searchOfficesForUi(searchValue);
});

btnContinue.addEventListener('click', function(){
    if ( !selectedDepartment){
        showAlert('messages-container', "Please select a department", 'error', false)
        return
    }

    setDepartment(userId, selectedDepartment)
    btnContinue.disabled = true
})

departmentsContainer.addEventListener("click", function (e) {
    const clickedDepartment = e.target.closest('.department-item')
    if (clickedDepartment){
        clickedDepartment.classList.add('selected')
        document.querySelectorAll('.department-item').forEach(function(item) {
            if (item !== clickedDepartment) {
                item.classList.remove('selected');
            }
        });

        const clickedOffice = officeList.find(office=> office.officeName == clickedDepartment.getAttribute('data-office_name'))
        if (clickedOffice) selectedDepartment = clickedOffice
    }

});

function setDepartment(userId, selectedDepartment){
    const csrftoken = Cookies.get('csrftoken')

    const formData = new FormData()
    formData.append('office_name', selectedDepartment.officeName)
    formData.append('department_name', selectedDepartment.departmentName)

    const options = {
            method: 'POST',
            headers: {'X-CSRFToken': csrftoken},
            mode: 'same-origin',
            body: formData
        }
    
    fetch(`/accounts/selectdept/${userId}/`, options)
    .then(response => {
        if (response.status !== 200){
            showAlert('messages-container', "An error occured, please try again", 'error', false)
        }
        else{
            btnContinue.disabled= false
            window.location.href = `/accounts/welcomeuser/${userId}/`
        }
    })
}

function searchOfficesForUi(word) {
  const offices = searchOffices(word);
  departmentsContainer.innerHTML = "";
  if (offices.length < 1) {
    //string didnt match any offices
    const notFound = `<div class="department-not-found">
        <i class="ri-indeterminate-circle-line"></i>
        <p>Department not found</p>
    </div>`;
    departmentsContainer.insertAdjacentHTML("afterbegin", notFound);
    return;
  }

  offices.forEach(function (office) {
    const departmentItem = `<div class="department-item" data-office_name="${office.officeName}" data-dept_name="${office.departmentName}">
        <span class="selected-indicator"></span>
        <div class="right">
            <p class="office-name">${office.officeName}</p>
            <p class="department-name">${office.departmentName}</p>
        </div>
    </div>`;

    departmentsContainer.insertAdjacentHTML("afterbegin", departmentItem);
  });
}

function searchOffices(word) {
  itemsFound = officeList
    .filter(
      (office) =>
        office.officeName.toLowerCase().includes(word.toLowerCase()) ||
        office.departmentName.toLowerCase().includes(word.toLowerCase())
    )
    .reverse();
  return itemsFound;
}
