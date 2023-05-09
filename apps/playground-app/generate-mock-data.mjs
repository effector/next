import "zx/globals";
import { faker } from "@faker-js/faker";

function list(cb) {
  const count = Math.ceil(Math.random() * 10);

  const result = [];

  for (let i = 0; i < count + 1; i++) {
    result.push(cb());
  }

  return result;
}

const fakeCompanies = list(() => ({
  id: faker.datatype.uuid(),
  name: faker.company.name(),
  imageLink: faker.image.business(250, 250, true),
  description: faker.company.bs(),
}));

const getFakeCat = () => ({
  kind: faker.animal.cat(),
  imageLink: faker.image.cats(250, 250, true),
  description: faker.lorem.sentence(),
});
const fakeCats = list(getFakeCat);

const getFakeProduct = () => ({
  id: faker.datatype.uuid(),
  name: faker.commerce.productName(),
  imageLink: faker.image.food(250, 250, true),
  description: faker.commerce.productDescription(),
  price: faker.commerce.price(100, 200, 0, "$"),
  category: faker.commerce.department(),
});
const fakeProducts = list(getFakeProduct);

const mocks = {
  companies: fakeCompanies,
  cats: fakeCats,
  products: fakeProducts,
};

fs.writeJSONSync("mocks.json", mocks, { spaces: 2 });
