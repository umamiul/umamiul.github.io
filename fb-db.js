const category = document.querySelector('.menu-container2');

const renderRecipe = (data, id) => {
  const html = `
    <div class="menu-category full-width" id="predjelo" data-id="${id}">
      <h2>${data.ktg}</h2>
      <!-- Item -->
      <div class="menu-item">
        <div class="accordian">
          <input type="checkbox" id="trigger${data.name}"/>
          <label for="trigger${data.name}">${data.name}</label>
          <div>
            <img src="umami.jpg" alt="miks sireva" loading="lazy" class="custom-image">
          </div>
        </div>
        <div class="item-price">${data.price}&euro;</div>
      </div>
    </div>
  `;
  category.innerHTML += html;
};

// remove recipe
const removeRecipe = (id) => {
  const category = document.querySelector(`.category[data-id=${id}]`);
  category.remove();
};