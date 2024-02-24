const searchInput = document.querySelector(".search-input");
const departmentsContainer = document.querySelector(".departments-container");

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

departmentsContainer.addEventListener("click", function (e) {
    const clickedDepartment = e.target.closest('.department-item')
    console.log(clickedDepartment)
    if (clickedDepartment){
        clickedDepartment.classList.add('selected')

        document.querySelectorAll('.department-item').forEach(function(item) {
            if (item !== clickedDepartment) {
                item.classList.remove('selected');
            }
        });

    }

});

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
    const departmentItem = `<div class="department-item" data-office_name="{{office.office_name}}" data-dept_name="{{office.department.dept_name}}">
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
        office.officeName.toLowerCase().includes(searchValue.toLowerCase()) ||
        office.departmentName.toLowerCase().includes(searchValue.toLowerCase())
    )
    .reverse();
  return itemsFound;
}
