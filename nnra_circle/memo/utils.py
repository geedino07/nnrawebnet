from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

def paginate(item_list, item_count, page_number):
    paginator = Paginator(item_list, item_count)

    try:
        page = paginator.page(page_number)
    except PageNotAnInteger:
        page = paginator.page(1)
    except EmptyPage:
        page = paginator.page(paginator.num_pages)

    return page