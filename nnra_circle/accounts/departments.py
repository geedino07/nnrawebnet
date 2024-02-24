from .models import Department, Office
from django.http import JsonResponse
import json
from django.core.serializers import serialize

department_list =[
    'ICT division',
    'Authorization and enforcement',
    'Finance',
    'Admin',
]

offices_dict ={
    'Reception': None,
    'Library': 'ICT division',
    'RAIS Room': 'ICT division',
    'Server room': 'ICT division',
    'DG Office extension': None,
    'Quality management & Technical services': 'Authorization and enforcement',
    'Regulatory Requirements': 'Authorization and enforcement',
    'Regulatory compliance': 'Authorization and enforcement',
    'Enforcement': 'Authorization and enforcement',
    'Licensing': 'Authorization and enforcement',
    'Cash office': 'Finance',
    'Accounts': 'Finance',
    'Human resources/quality control': 'Admin',
    'Registry': 'Admin',
    'Welfare office': 'Admin',
    'Transport': 'Admin',
    'Drivers': 'Admin',
    'Research reactor & Power reactor': None,
    'Emergency unit': None,
    'Safeguard': None,
    'Nuclear security': None,
    'DSS Office': None,
    'Legal': None,
    'Audit': None,
    'Procurement': None,
    'Store division': None,
    'Radiological safety': None,
    'Zonal desk office': None,
    'Medical': None,
    'Industrial application': None,
    'Radiological waste': None,
    'Monitoring & dosimetry services/public exposure': None,
    'Nuclear security centre': None,
    'Protocol & Information': None,
    'Budget': None,
    'Archive': None,
    'Maintenance (Works and services)': None,
    'Project managementoffice ppp': None,
}



def seed_departments(request):
    for department in department_list:
        dept = Department.objects.create(dept_name=department)
        print(f"created {dept.dept_name}")
    
    department_data = serialize('json', Department.objects.all())
    all_departments = json.loads(department_data)
    return JsonResponse(all_departments, safe=False)


def seed_offices(request):
    for office_name, dept_name in offices_dict.items():
        if dept_name != None:
            try:
                department = Department.objects.get(dept_name=dept_name)
            except Department.DoesNotExist:
                department= None
        else:
            department = None
        
        office = Office.objects.create(department=department, office_name=office_name)
        print(f"created office {office.office_name}")

    offices_data = serialize('json', Office.objects.all())
    all_offices = json.loads(offices_data)
    return JsonResponse(all_offices, safe=False)

