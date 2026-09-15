// @todo: напишите здесь код парсера

function parsePage() {

    // META
    const language = document.querySelector('html').getAttribute('lang');
    const title = document.querySelector('title').textContent.split('—')[0].trim();
    const keywords = document.querySelector('meta[name="keywords"]').getAttribute('content').split(',').map(keyword => keyword.trim());
    const description = document.querySelector('meta[name="description"]').getAttribute('content').trim();
    const ogTags = getOgTags();

    // PRODUCT
    const produckSection = document.querySelector('section');
    const productID = produckSection.dataset.id;
    const productImages = getProductImages();
    const isLiked = produckSection.querySelector('.like').classList.contains('active');
    const productName = produckSection.querySelector('h1').textContent.trim();
    const productTags = getProductTags();
    const productPrice = getProductPrice();
    const properties = getProperties();
    const productDescription = getDescription(produckSection.querySelector('.description'));

    //SUGGESTED
    const suggested = e => {
        const suggestedItemsList = document.querySelector('.suggested .items');
        suggestedItemsList.querySelectorAll('article').forEach(item => {
            const obj = {};
            obj.name = item.querySelector('h3').textContent.trim();
            obj.description = item.querySelector('p').textContent.trim();
            obj.image = item.querySelector('img').getAttribute('src');
            obj.price = `${parseFloat(item.querySelector('b').textContent.trim().replace(/[^0-9.,]/g, '').replace(',', '.'))}`;
            obj.currency = item.querySelector('b').textContent.trim().replace(/[^₽$€]/g, '');
            switch (obj.currency) {
                case '₽':
                    obj.currency = 'RUB';
                    break;
                case '$':
                    obj.currency = 'USD';
                    break;
                case '€':
                    obj.currency = 'EUR';
                    break;
            }
            e.push(obj);
        });
    }

    const suggestedItems = [];
    suggested(suggestedItems);

    //REVIEWS
    const reviews = e => { 
        const reviewsItemsList = document.querySelector('.reviews .items');
        reviewsItemsList.querySelectorAll('article').forEach(item => {
            const obj = {};
            obj.rating = item.querySelector('.rating').querySelectorAll('.filled').length;
            const author = {};
            author.name = item.querySelector('.author').querySelector('span').textContent.trim();
            author.avatar = item.querySelector('.author').querySelector('img').getAttribute('src').trim();
            obj.author = author;
            obj.title = item.querySelector('.title').textContent.trim();
            obj.description = item.querySelector('.title').nextElementSibling.textContent.trim();
            obj.date = item.querySelector('i').textContent.replace(/[/]/g, '.');
            e.push(obj);
        });
    }

    const reviewsItems = [];
    reviews(reviewsItems);

    function getOgTags() {
        const ogTags = {};
        const ogElements = document.querySelectorAll('meta[property^="og:"]');
        ogElements.forEach(element => {
            const property = element.getAttribute('property').replace('og:', '');
            const content = element.getAttribute('content');
            ogTags[property] = content;
        });
        ogTags['title'] = ogTags['title'].split('—')[0].trim();
        return ogTags;
    }

    function getProductImages() {
        const images = [];
        const imagesList = produckSection.querySelector('nav');
        imagesList.querySelectorAll('img').forEach(img => {
            img.parentElement.hasAttribute('disabled') ? images.push({
                preview: img.getAttribute('src'),
                full: img.getAttribute('data-src'),
                alt: img.getAttribute('alt')
            }) : null;
        });
        imagesList.querySelectorAll('img').forEach(img => {
            img.parentElement.hasAttribute('disabled') ? null : images.push({
                preview: img.getAttribute('src'),
                full: img.getAttribute('data-src'),
                alt: img.getAttribute('alt')
            });
        });
        return images;
    }

    function getProductTags() {
        const tags = {};
        const tagsList = produckSection.querySelector('.tags');
        tags.category = Array.from(tagsList.querySelectorAll('.green')).map(el => el.textContent);
        tags.discount = Array.from(tagsList.querySelectorAll('.red')).map(el => el.textContent);
        tags.label = Array.from(tagsList.querySelectorAll('.blue')).map(el => el.textContent);
        return tags;
    }

    function getProductPrice() {
        const productPrice = produckSection.querySelector('.price').textContent.trim().split('\n');
        const price = parseFloat(productPrice[0].trim().replace(/[^0-9.,]/g, '').replace(',', '.'));
        const oldPrice = parseFloat(productPrice[1].trim().replace(/[^0-9.,]/g, '').replace(',', '.'));
        const discount = oldPrice - price;
        const discountPercent = `${((discount / oldPrice) * 100).toFixed(2)}%`;
        let currency = '';
        switch (productPrice[0].trim().replace(/[^₽$€]/g, '')) {
            case '₽':
                currency = 'RUB';
                break;
            case '$':
                currency = 'USD';
                break;
            case '€':
                currency = 'EUR';
                break;
        }
        return {
            price: price,
            oldPrice: oldPrice,
            discount: discount,
            discountPercent: discountPercent,
            currency: currency
        };
    }

    function getProperties() {
        const properties = {};
        const propertiesList = produckSection.querySelector('.properties');
        propertiesList.querySelectorAll('li').forEach(li => {
            const [key, value] = li.textContent.trim().split('\n');
            properties[key] = value.trim();
        });
        return properties;
    }

    function getDescription(element) {
        if (!element) return '';
        const clone = element.cloneNode(true);
        clone.querySelectorAll('*').forEach(el => {
            Array.from(el.attributes).forEach(attr => el.removeAttribute(attr.name));
        });
        return clone.innerHTML.trim();
    }

    return {
        meta: {
            title: title,
            description: description,
            keywords: keywords,
            language: language,
            opengraph: ogTags
        },
        product: {
            id: productID,
            name: productName,
            isLiked: isLiked,
            tags: productTags,
            price: productPrice.price,
            oldPrice: productPrice.oldPrice,
            discount: productPrice.discount,
            discountPercent: productPrice.discountPercent,
            currency: productPrice.currency,
            properties: properties,
            description: productDescription,
            images: productImages
        },
        suggested: suggestedItems,
        reviews: reviewsItems
    };
}

window.parsePage = parsePage;