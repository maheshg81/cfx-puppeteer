const puppeteer = require('puppeteer');
const CREDS = require('./creds');


///sample test

const userToSearch = 'john'
const searchUrl  = 'https://github.com/search?q=john&type=Users&utf8=%E2%9C%93';

const USERNAME_SELECTOR = '#login_field';
const PASSWORD_SELECTOR = '#password';
const SIGNIN_SELECTOR = '#login > form > div.auth-form-body.mt-3 > input.btn.btn-primary.btn-block';

const LENGTH_SELECTOR_CLASS = 'user-list-item';
const LIST_USERNAME_SELECTOR = '#user_search_results > div.user-list > div:nth-child(INDEX) > div.flex-auto > div:nth-child(1) > div.f4.text-normal > a';
const LIST_EMAIL_SELECTOR = '#user_search_results > div.user-list > div:nth-child(INDEX) > div.flex-auto > div.d-flex.flex-wrap.text-small.text-gray > div:nth-child(2) > a';


async function run() {
  const browser = await puppeteer.launch({
      headless: false
  });
  const page = await browser.newPage();
  
  await page.goto('https://github.com/login');

  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(CREDS.username);

  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(CREDS.password);

  await page.click(SIGNIN_SELECTOR);
  //await page.waitForNavigation();

  await page.goto(searchUrl);
  await page.waitFor(2*1000)

  let listLength = await page.evaluate((sel) => {
      return document.getElementsByClassName(sel).length;
  }, LENGTH_SELECTOR_CLASS);

  for (let i = 1; i <= listLength; i++) {
    // change the index to the next child
    let usernameSelector = LIST_USERNAME_SELECTOR.replace("INDEX", i);
    let emailSelector = LIST_EMAIL_SELECTOR.replace("INDEX", i);

    let username = await page.evaluate((sel) => {
        return document.querySelector(sel).getAttribute('href').replace('/', '');
      }, usernameSelector);


    let email = await page.evaluate((sel) => {
        let element = document.querySelector(sel);
        return element? element.innerHTML: null;
      }, emailSelector);

    // not all users have emails visible
    if (!email)
      continue;

    console.log(username, ' -> ', email);

    // TODO save this user
}
  
  browser.close();
}

run();