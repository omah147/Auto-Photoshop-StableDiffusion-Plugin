// import {helloHelper} from 'helper.js'
// helloHelper2 = require('./helper.js')
// for organizational proposes

const helper = require('./helper')
const sdapi = require('./sdapi')
const exportHelper = require('./export_png')
const outpaint = require('./outpaint')
const psapi = require('./psapi')
const app = window.require('photoshop').app

const { batchPlay } = require('photoshop').action
const { executeAsModal } = require('photoshop').core
const dialog_box = require('./dialog_box')
const {entrypoints} = require('uxp')

// attach event listeners for tabs
Array.from(document.querySelectorAll(".sp-tab")).forEach(theTab => {
  theTab.onclick = () => {
    // localStorage.setItem("currentTab", theTab.getAttribute("id"));
    Array.from(document.querySelectorAll(".sp-tab")).forEach(aTab => {
      if (aTab.getAttribute("id") === theTab.getAttribute("id")) {
        aTab.classList.add("selected");
      } else {
        aTab.classList.remove("selected");
      }
    });
    Array.from(document.querySelectorAll(".sp-tab-page")).forEach(tabPage => {
      if (tabPage.getAttribute("id").startsWith(theTab.getAttribute("id"))) {
        tabPage.classList.add("visible");
      } else {
        tabPage.classList.remove("visible");
      }
    });
  }
});


// entrypoints.setup({

//   panels:{
//     vanilla: ()=>{
//       console.log("you are in the vanilla panel")
//     },
//     experimental_1: ()=>{
//       console.log("you are in the experimental_1 panel")
      
//     } 
//   }
// }
//   )
// just a number that shouldn't unique enough that we will use when save files.
// each session will get a number from 1 to 1000000
const random_session_id = Math.floor((Math.random() * 1000000) + 1);

function getSelectedText() // JavaScript
{
//     // Obtain the object reference for the <textarea>
    // const txtarea = document.getElementById("taPrompt");
    const promptTextarea = document.querySelector('#taPrompt')
    console.log("promptTextarea: ", promptTextarea.value)
//     // Obtain the index of the first selected character
    var start = promptTextarea.selectionStart;
    console.log("start: ",start)
//     // Obtain the index of the last selected character
//     var finish = txtarea.selectionEnd;
//     console.log("finish: ",finish)

//     // Obtain the selected text
//     var sel = txtarea.value.substring(start, finish);
//     console.log("selected textarea: ", sel)
    

    // Do something with the selected content
}
// setInterval(getSelectedText,2000)
function getCommentedString(){
  // const text = document.getElementById("taPrompt").value
  // let text = `Visit /*W3Schools 
  // cute, girl, painterly   
  // *\\ any text
  // and prompt`;
  // let text = `cute cat /*by greg 

  // and artgerm 
  
  //  */ and famous artist`
  let text = `Visit /*W3Schools 
  cute, girl, painterly   
  */ any text
  and prompt




 cute cat  /*by greg 

  and artgerm 
  
   */ and famous artist`
  console.log("getCommentedString: text: ",text)
 
  // let pattern = /(\/)(\*)(\s|\S)*\*\\/g;
  let pattern = /(\/)(\*)(\s|\S)*?(\*\/)/g;

  let result = text.match(pattern);
  console.log("getCommentedString: ",result)
}

//duplicate the active layer
async function duplication () {
  try {
    console.log('active layer id: ', app.activeDocument.activeLayers[0].id)
    await executeAsModal(async () => {
      let inner_new_layer = await app.activeDocument.activeLayers[0].duplicate()
      console.log('inner_new_layer id: ', inner_new_layer.id)
    })

    console.log('new active layer id: ', app.activeDocument.activeLayers[0].id)
  } catch (e) {
    console.log('duplication error:', e)
  }
}

function tempDisableElement(element,time){

  element.disabled = true;
  element.style.opacity = "0.65"; 
  element.style.cursor =  "not-allowed";
  setTimeout(function() {
    element.disabled = false;
    element.style.opacity = "1.0"; 
  element.style.cursor =  "default";
  }, time);
}


async function refreshUI(){
  
  await initSamplers()
  await refreshModels()
  await updateVersionUI()
}
async function refreshModels () {
  try{

    g_models = await sdapi.requestGetModels()
    // const models_menu_element = document.getElementById('mModelsMenu')
  // models_menu_element.value = ""
  document.getElementById('mModelsMenu').innerHTML = ''
  
  for (let model of g_models) {
    console.log(model.title)
    const menu_item_element = document.createElement('sp-menu-item')
    menu_item_element.innerHTML = model.title
    document.getElementById('mModelsMenu').appendChild(menu_item_element)
  }
}catch(e){
  console.warn(e)
}
}


async function updateVersionUI(){
  
    try{
      version = await sdapi.getVersionRequest()
    document.getElementById('lVersionNumber').textContent = version
    }
    catch (e){
      console.warn(e)
      document.getElementById('lVersionNumber').textContent = "v0.0.0"
    }
  
}

async function initSamplers () {
 try{

   let sampler_group = document.getElementById('sampler_group')
   sampler_group.innerHTML = ''

  samplers = await sdapi.requestGetSamplers()
  for (sampler of samplers) {
    console.log(sampler)
    // sampler.name
    // <sp-radio class="rbSampler" value="Euler">Euler</sp-radio>
    const rbSampler = document.createElement('sp-radio')
    
    rbSampler.innerHTML = sampler.name
    rbSampler.setAttribute('class', 'rbSampler')
    rbSampler.setAttribute('value', sampler.name)

    sampler_group.appendChild(rbSampler)
    //add click event on radio button for Sampler radio button, so that when a button is clicked it change g_sd_sampler globally
    
    rbSampler.addEventListener('click', evt => {
      g_sd_sampler = evt.target.value
      console.log(`You clicked: ${g_sd_sampler}`)
    })
  }
  document.getElementsByClassName('rbSampler')[0].setAttribute('checked', '')
}catch(e){
  console.warn(e)
}
}


function promptShortcutExample(){

  let prompt_shortcut_example = {
    "game_like": "Unreal Engine, Octane Render, arcane card game ui, hearthstone art style, epic fantasy style art",
    "large_building_1": "castle, huge building, large building",
    "painterly_style_1": "A full portrait of a beautiful post apocalyptic offworld arctic explorer, intricate, elegant, highly detailed, digital painting, artstation, concept art, smooth, sharp focus, illustration",
    "ugly": " ((((ugly)))), (((duplicate))), ((morbid)), ((mutilated)), out of frame, extra fingers, mutated hands, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), ((ugly)), blurry, ((bad anatomy)), (((bad proportions))), ((extra limbs)), cloned face, (((disfigured))), out of frame, ugly, extra limbs, (bad anatomy), gross proportions, (malformed limbs), ((missing arms)), ((missing legs)), (((extra arms))), (((extra legs))), mutated hands, (fused fingers), (too many fingers), (((long neck)))"
  }
  var JSONInPrettyFormat = JSON.stringify(prompt_shortcut_example, undefined, 7);
  document.getElementById('taPromptShortcut').value = JSONInPrettyFormat
}
//steps to load init_image:
//duplicate the active layer
// duplication()
// create a mask from marquee selection

// export the layer as png
//load the image from disk to panel as <img /> tag
//store the relative path of the image into init_img_path to be load from the python server (serverMain.py)
//

//**********Start: global variables
let prompt_dir_name = ''
let gImage_paths = []
gCurrentImagePath = ''
let g_init_image_name = ''
let numberOfImages = document.querySelector('#tiNumberOfImages').value
let g_sd_mode = 'txt2img'
let g_sd_sampler = 'Euler a'
let g_denoising_strength = 0.7
let g_use_mask_image = false
let g_models = []
let g_model_title = ''
let gWidth = 512
let gHeight = 512
let g_inpainting_fill = 0
let g_last_outpaint_layers = []
let g_last_inpaint_layers = []
let g_last_snap_and_fill_layers = []

let g_metadatas = []
let g_can_request_progress = true
let g_saved_active_layers = []
let g_is_active_layers_stored = false
//********** End: global variables */

//***********Start: init function calls */

refreshModels() // get the models when the plugin loads
displayUpdate()
initSamplers()
updateVersionUI()
promptShortcutExample()
//***********End: init function calls */

//add click event on radio button mode, so that when a button is clicked it change g_sd_mode globally
rbModeElements = document.getElementsByClassName('rbMode')
for (let rbModeElement of rbModeElements) {
  rbModeElement.addEventListener('click', evt => {
    g_sd_mode = evt.target.value
    console.log(`You clicked: ${g_sd_mode}`)
    displayUpdate()
  })
}

rbMaskContentElements = document.getElementsByClassName('rbMaskContent')

for (let rbMaskContentElement of rbMaskContentElements) {
  rbMaskContentElement.addEventListener('click', evt => {
    g_inpainting_fill = evt.target.value

    console.log(`You clicked: ${g_inpainting_fill}`)
    displayUpdate()
  })
}

// //add click event on radio button for Sampler radio button, so that when a button is clicked it change g_sd_sampler globally
// rbSamplerElements = document.getElementsByClassName('rbSampler')
// for (let rbSamplerElement of rbSamplerElements) {
//   rbSamplerElement.addEventListener('click', evt => {
//     g_sd_sampler = evt.target.value
//     console.log(`You clicked: ${g_sd_sampler}`)
//   })
// }
// document.getElementById('chUseMaskImage').addEventListener("click",evt=>{
//   g_use_mask_image = evt.target.checked
//   console.log(`g_use_mask_image:? ${g_use_mask_image}`);

// })

// show the interface that need to be shown and hide the interface that need to be hidden
function displayUpdate () {
  if (g_sd_mode == 'txt2img') {
    document.getElementById('slDenoisingStrength').style.display = 'none' // hide denoising strength slider
    // document.getElementById("image_viewer").style.display = 'none' // hide images
    document.getElementById('init_image_container').style.display = 'none' // hide init image
    document.getElementById('init_image_mask_container').style.display = 'none' // hide init mask
    document.getElementById('slInpainting_fill').style.display = 'none' // hide inpainting fill mode
    
    document.getElementById('btnSnapAndFill').style.display = 'none'//"none" will  misaligned the table // hide snap and fill button
  }

  if (g_sd_mode == 'img2img') {
    document.getElementById('slDenoisingStrength').style.display = 'block' // show denoising strength
    // document.getElementById("image_viewer").style.display = 'block'
    document.getElementById('init_image_container').style.display = 'block' // hide init image

    document.getElementById('init_image_mask_container').style.display = 'none' // hide mask
    document.getElementById('slInpainting_fill').style.display = 'none' // hide inpainting fill mode
    document.getElementById('btnSnapAndFill').style.display = 'inline-flex' // hide snap and fill button mode
  }
  if (g_sd_mode == 'inpaint') {
    ///fix the misalignment problem in the ui (init image is not aligned with init mask when switching from img2img to inpaint ). note: code needs refactoring   
    document.getElementById('btnSnapAndFill').style.display = 'none'//"none" will  misaligned the table // hide snap and fill button
    document.getElementById('tableInitImageContainer').style.display = 'none' // hide the table 
    setTimeout(() => {
      document.getElementById('tableInitImageContainer').style.display = 'table' // show the table after some time so it gets rendered. 
    }, 100);
    

    document.getElementById('slDenoisingStrength').style.display = 'block'
    document.getElementById('init_image_mask_container').style.display = 'block'
    document.getElementById('slInpainting_fill').style.display = 'block'
    document.getElementById('init_image_container').style.display = 'block' // hide init image

    document.getElementById('btnInitOutpaint').style.display = 'inline-flex'
    document.getElementById('btnInitInpaint').style.display = 'inline-flex'
    // document.getElementById('btnInitOutpaint').style.display = 'none'
    // document.getElementById('btnInitInpaint').style.display = 'none'
  } else {//txt2img or img2img
    document.getElementById('btnInitOutpaint').style.display = 'none'
    document.getElementById('btnInitInpaint').style.display = 'none'
  }
}
// function showLayerNames () {
//   const app = window.require('photoshop').app
//   const allLayers = app.activeDocument.layers
//   const allLayerNames = allLayers.map(
//     layer => `${layer.name} (${layer.opacity} %)`
//   )

//   const sortedNames = allLayerNames.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
//   document.getElementById('layers').innerHTML = `
//         <ul>${sortedNames.map(name => `<li>${name}</li>`).join('')}</ul>`
// }

async function addNewLayer () {
  document.getElementById('layers').innerHTML = `<span>
    addNewLayer was called
    </span>`
  await require('photoshop').core.executeAsModal(newNormalLayer)
  // app.activeDocument.createLayer({ name: "myLayer", opacity: 80, mode: "colorDodge" });
}

async function newColorDodgeLayer (executionContext) {
  document.getElementById('layers').innerHTML = `<span>
        newColorDogeLayer was called
        </span>`
  await app.activeDocument.createLayer({
    name: 'myLayer',
    opacity: 80,
    mode: 'colorDodge'
  })
}

async function newNormalLayer (executionContext) {
  document.getElementById('layers').innerHTML = `<span>
    Normal was called
    </span>`
  await app.activeDocument.createLayer({
    name: 'myLayer',
    opacity: 100,
    mode: 'normal'
  })
}

function selectTool () {
  var doc = app.activeDocument
  var activeTool = app.currentTool

  // if (activeTool !== toolName) {
  //   toolName = activeTool;
  //   doc.activeTool = toolName;
  // }
  // const util = require('util')

  // console.log(util.inspect(myObject, {showHidden: false, depth: null, colors: true}))
  console.dir(app, { depth: null })
  console.log('hello this is Abdullah')
  document.getElementById('layers').innerHTML = `<span>
    selectTool was called, ${activeTool}
    </span>`

  //rectanglemarquee
  // await require('photoshop').core.executeAsModal(newNormalLayer);
}

async function testServerPath () {
  // const serverPath = "https://api.github.com/users/abdullah"

  try {
    // const serverPath = 'https://api.weather.gov/points/123.4,342.5'
    // const serverPath = 'https://api.github.com/users/abdullah'
    // const serverPath = "https://api.coindesk.com/v1/bpi/currentprice.json"
    // const serverPath = "http://127.0.0.1:3000"
    // const serverPath = "http://localhost:3000"
    const serverPath = 'http://127.0.0.1:8000/txt2img/random%20prompt'
    // const serverPath = "https://3330-37-106-100-102.eu.ngrok.io"
    console.log('testServerPath function was called')

    let response = await fetch(serverPath)
    console.log('testServerPath finished fetch')

    if (!response.ok) {
      throw new Error(
        `HTTP error fetching weather station; status: ${response.status}`
      )
    }
    let stationJson = await response.json()
    console.dir(stationJson)
  } catch (err) {
    console.error('testServerPath error: ' + err.message)
  }
}

// User picks an image file
// open a explorer for user to select a image file
async function fillImage () {
  const storage = require('uxp').storage
  const fs = storage.localFileSystem
  let imageFile = await fs.getFileForOpening({
    types: storage.fileTypes.images
  })

  // Create ImageFill for this image
  const ImageFill = require('scenegraph').ImageFill
  let fill = new ImageFill(imageFile)

  // Set fill of first selected item
  selection.items[0].fill = fill
}
// fillImage()

function pastImage2Layer () {
  const { batchPlay } = require('photoshop').action
  const { executeAsModal } = require('photoshop').core

  executeAsModal(
    () => {
      // batchPlay([command], {})
      const result = batchPlay(
        [
          {
            _obj: 'paste',
            antiAlias: {
              _enum: 'antiAliasType',
              _value: 'antiAliasNone'
            },
            as: {
              _class: 'pixel'
            },
            _options: {
              dialogOptions: 'dontDisplay'
            }
          }
        ],
        {
          synchronousExecution: false,
          modalBehavior: 'fail'
        }
      )
    },
    {
      commandName: 'Create Label'
    }
  )
}
function sliderToResolution (sliderValue) {
  return sliderValue * 64
}

document.querySelector('#slHeight').addEventListener('input', evt => {
  gHeight = sliderToResolution(evt.target.value)
  document.querySelector('#lHeight').textContent = gHeight
})
document.querySelector('#slWidth').addEventListener('input', evt => {
  gWidth = sliderToResolution(evt.target.value)
  document.querySelector('#lWidth').textContent = gWidth
})
document.querySelector('#slInpaintPadding').addEventListener('input', evt => {
  padding = evt.target.value * 4
  document.querySelector('#lInpaintPadding').textContent = padding
})

document
  .querySelector('#slDenoisingStrength')
  .addEventListener('input', evt => {
    const denoising_string_value = evt.target.value / 100.0
    g_denoising_strength = denoising_string_value
    // document.querySelector('#lDenoisingStrength').value= Number(denoising_string_value)
    document.querySelector('#lDenoisingStrength').textContent =
      denoising_string_value
    document.getElementById(
      'lDenoisingStrength'
    ).innerHTML = `${denoising_string_value}`
    // console.log(`New denoising_string_value: ${document.querySelector('#tiDenoisingStrength').value}`)
  })

// document.getElementById('btnPopulate').addEventListener('click', showLayerNames)

document
  .getElementById('btnSnapAndFill')
  .addEventListener('click', async () => {

    const isSelectionAreaValid = await psapi.checkIfSelectionAreaIsActive()
    if(isSelectionAreaValid){
      
      
      // clear the layers related to the last mask operation.
      g_last_snap_and_fill_layers = await psapi.cleanSnapAndFill(g_last_snap_and_fill_layers)
      // create new layers related to the current mask operation.
      g_last_snap_and_fill_layers = await outpaint.snapAndFillExe(random_session_id)
      console.log ("outpaint.snapAndFillExe(random_session_id):, g_last_snap_and_fill_layers: ",g_last_snap_and_fill_layers)
    }else{
      psapi.promptForMarqueeTool()

    }
  })



document
  .getElementById('btnInitOutpaint')
  .addEventListener('click', async () => {
    try{

      const isSelectionAreaValid = await psapi.checkIfSelectionAreaIsActive()
      
      if (isSelectionAreaValid){
        // clear the layers related to the last mask operation.
        g_last_outpaint_layers = await psapi.cleanLayers(g_last_outpaint_layers)
        // create new layers related to the current mask operation.
        
        g_last_outpaint_layers = await outpaint.outpaintFasterExe(random_session_id)
        console.log ("outpaint.outpaintFasterExe(random_session_id):, g_last_outpaint_layers: ",g_last_outpaint_layers)
      }
      else{
        psapi.promptForMarqueeTool()        

        console.log("please use the rectangular marquee tool and select an area")
      }
    }
    catch(e){
      console.warn("selection area is not valid, please use the rectangular marquee tool",e)
    }
  })

document
  .getElementById('btnInitInpaint')
  .addEventListener('click', async () => {
    const isSelectionAreaValid = await psapi.checkIfSelectionAreaIsActive()
    if(isSelectionAreaValid){

    // delete the layers of the previous mask operation
    g_last_inpaint_layers = await psapi.cleanLayers(g_last_inpaint_layers)
    // store the layer of the current mask operation
    g_last_inpaint_layers =  await outpaint.inpaintFasterExe(random_session_id)
    
    console.log ("outpaint.inpaintFasterExe(random_session_id):, g_last_inpaint_layers: ",g_last_inpaint_layers)
  }
  else{
    psapi.promptForMarqueeTool()
  }
  })

function toggleGenerateInterruptButton (defaultVal) {
  if (defaultVal) {

    document.querySelector('#btnGenerate').style.display = 'none' // hide generate button
    document.querySelector('#btnInterrupt').style.display = 'inline-block' // show interrupt button
    g_can_request_progress = true
  } else {
    document.querySelector('#btnGenerate').style.display = 'inline-block' // hide generate button
    document.querySelector('#btnInterrupt').style.display = 'none' // show interrupt button
    g_can_request_progress = false
  }
}

// document.getElementById('btnSelectTool').addEventListener('click', selectTool)

document.getElementById('btnRandomSeed').addEventListener('click', async () => {
  document.querySelector('#tiSeed').value = '-1'
})
document.getElementById('btnLastSeed').addEventListener('click', async () => {
  try{
    console.log("click on Last seed")
    let seed = '-1'

    console.log("g_metadatas.length: ",g_metadatas.length)
    if (g_metadatas.length > 0){
      seed = g_metadatas[0].Seed
    } 
    console.log("seed:",seed)
    document.querySelector('#tiSeed').value = seed
  }
  catch(e){
    console.warn(e)
  }
})

document.getElementById('btnCleanLayers').addEventListener('click', async () => {
  console.log("click on btnCleanLayers,  g_last_outpaint_layers:",g_last_outpaint_layers)
  console.log("click on btnCleanLayers,  g_last_inpaint_layers:",g_last_inpaint_layers)
  
  console.log("click on btnCleanLayers,  g_last_snap_and_fill_layers:",g_last_snap_and_fill_layers)

  
  console.log("g_last_snap_and_fill_layers")
  g_last_snap_and_fill_layers = await psapi.cleanSnapAndFill(g_last_snap_and_fill_layers)

  if (g_last_outpaint_layers.length > 0){
    g_last_outpaint_layers = await psapi.cleanLayers(g_last_outpaint_layers)
    console.log("g_last_outpaint_layers has 1 layers")

  }
  if (g_last_inpaint_layers.length> 0 ){
    g_last_inpaint_layers = await psapi.cleanLayers(g_last_inpaint_layers)

  }
})
document.getElementById('btnInterrupt').addEventListener('click', async () => {
  try{

    // g_can_request_progress = false
    json = await sdapi.requestInterrupt()
    
    toggleGenerateInterruptButton(false)
  }catch(e)
  {
    toggleGenerateInterruptButton(false)
    console.warn(e)
  }
})


//store active layers only if they are not stored.
async function storeActiveLayers () {
  setTimeout(async () => {
    
    const layers = await app.activeDocument.activeLayers
    console.log("storeActiveLayers: ", layers.length)
    
    if(layers.length > 0){
      g_saved_active_layers = layers
      await psapi.unselectActiveLayersExe()
    }
  }, 200);

  // if (g_is_active_layers_stored == false) {
  //   g_saved_active_layers = await app.activeDocument.activeLayers
  //   g_is_active_layers_stored = true
  //   await psapi.unselectActiveLayersExe()
  // } else {
  // }
}
async function restoreActiveLayers () {
  
  const layers = await app.activeDocument.activeLayers
  console.log("restoreActiveLayers: ", layers.length)
  if(layers.length == 0){
    await psapi.selectLayersExe(g_saved_active_layers)
    g_saved_active_layers = []
  }
  // if (g_is_active_layers_stored == true) {
  //   // g_saved_active_layers = await app.activeDocument.activeLayers
  //   await psapi.selectLayersExe(g_saved_active_layers)
  //   g_is_active_layers_stored = false
  //   g_saved_active_layers = []
  // } 
}
document.getElementById('btnSdUrl').addEventListener('click', async () => {
  //change the sdUrl in server in proxy server
  console.log("you clicked btnSdUrl")
  let new_sd_url = document.getElementById('tiSdUrl').value
  console.log("new_sd_url: ", new_sd_url)

  new_sd_url = new_sd_url.trim()
  console.log("new_sd_url.trim(): ", new_sd_url)

  if (new_sd_url.length > 0) {
    await sdapi.changeSdUrl(new_sd_url)
  }
})


document.querySelector('#taPrompt').addEventListener('focus', async () => {
  console.log("taPrompt focus")
  // console.log('we are in prompt textarea')
  // console.log("g_is_active_layers_stored: ",g_is_active_layers_stored)
  await storeActiveLayers()
  // await psapi.unselectActiveLayersExe()

})
document.querySelector('#taPrompt').addEventListener('blur', async () => {
  console.log("taPrompt blur")
  // console.log('we are out of prompt textarea')
  // await psapi.unselectActiveLayersExe()
  // console.log("g_is_active_layers_stored: ",g_is_active_layers_stored)
  await restoreActiveLayers()
})

document
  .querySelector('#taNegativePrompt')
  .addEventListener('focus', async () => {
    console.log("taNegativePrompt focus")
    // console.log('we are in prompt textarea')

    await storeActiveLayers()
    // await psapi.unselectActiveLayersExe()
  })
document
  .querySelector('#taNegativePrompt')
  .addEventListener('blur', async () => {
    console.log("taNegativePrompt blur")
    // console.log('we are out of prompt textarea')
    // await psapi.unselectActiveLayersExe()
    await restoreActiveLayers()
  })


document.getElementById('btnGenerate').addEventListener('click', async () => {
  
  toggleGenerateInterruptButton(true)
  numberOfImages = document.querySelector('#tiNumberOfImages').value
  numberOfSteps = document.querySelector('#tiNumberOfSteps').value

  const prompt = document.querySelector('#taPrompt').value
  const negative_prompt = document.querySelector('#taNegativePrompt').value
  // console.log("prompt:",prompt)
  // console.log("negative_prompt:",negative_prompt)
  const model_index = document.querySelector('#mModelsMenu').selectedIndex
  const cfg_scale = document.querySelector('#slCfgScale').value
  //  const model_index = document.querySelector("#")
  const seed = document.querySelector('#tiSeed').value
  const mask_blur = document.querySelector('#slMaskBlur').value
  const inpaint_full_res_padding = document.querySelector('#slInpaintPadding').value

  console.dir(numberOfImages)
  const bUsePromptShortcut = document.getElementById('chUsePromptShortcut').checked
  let prompt_shortcut_ui_dict = {}
  try {
    let prompt_shortcut_string = document.getElementById('taPromptShortcut').value
    prompt_shortcut_ui_dict = JSON.parse(prompt_shortcut_string)
  } catch (e) {
    console.warn(`warning prompt_shortcut_ui_dict is not valid Json obj: ${e}`)
    prompt_shortcut_ui_dict = {}
  }

  payload = {
    prompt: prompt,

    negative_prompt: negative_prompt,
    steps: numberOfSteps,
    // n_iter: numberOfImages,
    sampler_index: g_sd_sampler,
    width: gWidth,
    height: gHeight,
    batch_size: numberOfImages,
    cfg_scale: cfg_scale,
    seed: seed,
    mask_blur: mask_blur,
    use_prompt_shortcut: bUsePromptShortcut,
    prompt_shortcut_ui_dict: prompt_shortcut_ui_dict 
  }

  console.log({ payload })

  //wait 2 seconds till you check for progress
  // setInterval(function(){progressRecursive()},2000);
  setTimeout(function () {
    progressRecursive()

  }, 2000)
  if (g_sd_mode == 'txt2img') {
    json = await sdapi.requestTxt2Img(payload)
  
  } else if (g_sd_mode == 'img2img' || g_sd_mode == 'inpaint') {
    // g_denoising_strength = document.querySelector("#tiDenoisingStrength").value
    if (g_sd_mode == 'inpaint') {
      g_use_mask_image = true
      payload['inpaint_full_res'] =
        document.getElementById('chInpaintFullRes').checked
        payload['inpaint_full_res_padding'] = inpaint_full_res_padding *4
    } else {
      g_use_mask_image = false
      delete payload['inpaint_full_res'] //  inpaint full res is not available in img2img mode
      delete payload['inpaint_full_res_padding']
    }
    console.log(`g_use_mask_image:? ${g_use_mask_image}`)

    payload['denoising_strength'] = g_denoising_strength
    payload['init_image_name'] = g_init_image_name

    if (g_use_mask_image == true) {
      console.log('in true block')

      console.log('g_use_mask_image is ', g_use_mask_image)
      console.log('g_init_image_mask_name is ', g_init_image_mask_name)
      payload['init_image_mask_name'] = g_init_image_mask_name
      payload['inpainting_fill'] = g_inpainting_fill
      // payload['inpainting_fill'] = document.getElementById('slInpainting_fill').value // original
    } else {
      // console.log("g_init_image_mask_name is ",g_init_image_mask_name)
      // payload['init_image_mask_name'] = ""
      delete payload['init_image_mask_name']
      delete payload['inpainting_fill']
    }
    json = await sdapi.requestImg2Img(payload)
  }
  try {
  g_metadatas = []

  for (metadata of json.metadata) {
    metadata_json = JSON.parse(metadata)
    g_metadatas.push(metadata_json)
    console.log('metadata_json:', metadata_json)
  }
} catch (e) {
  console.warn(e)
}

  
  toggleGenerateInterruptButton(false)
  gImage_paths = json.image_paths
  await ImagesToLayersExe()
})

document
  .getElementById('btnRefreshModels')
  .addEventListener('click', (e)=>{
    refreshUI()
    tempDisableElement(e.target,3000)
  }
    )

document.querySelector('#mModelsMenu').addEventListener('change', evt => {
  const model_index = evt.target.selectedIndex
  console.log(`Selected item: ${evt.target.selectedIndex}`)
  let model = g_models[0]
  if (model_index < g_models.length) {
    model = g_models[model_index]
  }
  // g_model_name = `${model.model_name}.ckpt`
  g_model_title = model.title
  console.log('g_model_title: ', g_model_title)
  sdapi.requestSwapModel(g_model_title)
})

// document.getElementById('btnGetActiveLayer').addEventListener('click', getActiveLayer)
// document.getElementById('btnScaleDown').addEventListener('click', scaleDownLayer)
// document.getElementById('btnSelectionInfo').addEventListener('click', getSelectionInfo)
document
  .getElementById('btnLayerToSelection')
  .addEventListener('click', helper.layerToSelection)

// document.getElementById('bGetInitImage').addEventListener('click', () => {
//   sdapi.getInitImage(g_init_image_name)
// })

async function setInitImage () {
  // await exportHelper.exportPng()
  try {
    const layer = await app.activeDocument.activeLayers[0]
    old_name = layer.name 
    await psapi.exportPng(random_session_id)
    
    image_name = psapi.layerNameToFileName(old_name,layer.id,random_session_id)
    
    // image_name = psapi.layerToFileName(layer,random_session_id)

    image_name = `${image_name}.png`
    g_init_image_name = image_name
    console.log(image_name)
    const image_src = await sdapi.getInitImage(g_init_image_name)
    let ini_image_element = document.getElementById('init_image')
    ini_image_element.src = image_src
  } catch (e) {
    console.log('setInitImage error:', e)
  }
}
document.getElementById('bSetInitImage').addEventListener('click', setInitImage)

async function setInitImageMask () {
  try {
    const layer = await app.activeDocument.activeLayers[0]
    old_name = layer.name 
    await psapi.exportPng(random_session_id)
    image_name = psapi.layerNameToFileName(old_name,layer.id,random_session_id)
    
    //get the active layer name
    // const layer = await app.activeDocument.activeLayers[0]
    // image_name = psapi.layerToFileName(layer,random_session_id)
    image_name = `${image_name}.png`
    
    g_init_image_mask_name = image_name
    console.log(image_name)
    
    const image_src = await sdapi.getInitImage(g_init_image_mask_name)
    const ini_image_mask_element = document.getElementById('init_image_mask')
    ini_image_mask_element.src = image_src
  } catch (e) {
    
    console.error(`setInitImageMask error: ${e}`)
  }
}
document
  .getElementById('bSetInitImageMask')
  .addEventListener('click', setInitImageMask)

async function progressRecursive () {
  let json = await sdapi.requestProgress()
  document.querySelector('#pProgressBar').value = json.progress * 100
  if (json.progress > 0 && g_can_request_progress == true) {
    setTimeout(async ()=>{
      await progressRecursive()
    },500)
    
  }
}

// document
//   .getElementById('bGetProgress')
//   .addEventListener('click', progressRecursive)

function changeImage () {
  let img = document.getElementById('img1')
  img.src = 'https://source.unsplash.com/random'
}

// document.getElementById('btnChangeImage').addEventListener('click', changeImage)

async function imageToSmartObject () {
  const { batchPlay } = require('photoshop').action
  const { executeAsModal } = require('photoshop').core

  try {
    // const file = await fs.getFileForOpening()
    // token = await fs.getEntryForPersistentToken(file);
    // const entry = await fs.getEntryForPersistentToken(token);
    // const session_token = await fs.createSessionToken(entry);
    // // let token = await fs.createSessionToken(entry)
    await executeAsModal(
      async () => {
        console.log('imageToSmartObject():')
        const storage = require('uxp').storage
        const fs = storage.localFileSystem
        let pluginFolder = await fs.getPluginFolder()
        let img = await pluginFolder.getEntry('image1.png')
        const result = await batchPlay(
          [
            {
              _obj: 'placeEvent',
              ID: 95,
              null: {
                _path: img,
                _kind: 'local'
              },
              freeTransformCenterState: {
                _enum: 'quadCenterState',
                _value: 'QCSAverage'
              },
              offset: {
                _obj: 'offset',
                horizontal: {
                  _unit: 'pixelsUnit',
                  _value: 0
                },
                vertical: {
                  _unit: 'pixelsUnit',
                  _value: 0
                }
              },
              replaceLayer: {
                _obj: 'placeEvent',
                from: {
                  _ref: 'layer',
                  _id: 56
                },
                to: {
                  _ref: 'layer',
                  _id: 70
                }
              },
              _options: {
                dialogOptions: 'dontDisplay'
              }
            }
          ],
          {
            synchronousExecution: false,
            modalBehavior: 'fail'
          }
        )
      },
      {
        commandName: 'Create Label'
      }
    )
  } catch (e) {
    console.log('imageToSmartObject() => error: ')
    console.log(e)
  }
}

// document.getElementById('btnNewLayer').addEventListener('click', imageToSmartObject )

async function fillLayer () {
  // User picks an image file
  const storage = require('uxp').storage
  const fs = storage.localFileSystem
  let imageFile = await fs.getFileForOpening({
    types: storage.fileTypes.images
  })

  // Create ImageFill for this image
  const ImageFill = require('scenegraph').ImageFill
  let fill = new ImageFill(imageFile)

  let layer = getActiveLayer()
  layer.fillImage()
}
//fillLayer()

// Set fill of first selected item
// selection.items[0].fill = fill;

async function placeEmbedded () {
  console.log('placeEmbedded():')

  const { batchPlay } = require('photoshop').action
  const { executeAsModal } = require('photoshop').core

  const storage = require('uxp').storage
  const fs = storage.localFileSystem
  entry = await fs.getFileForOpening()
  let token = fs.createSessionToken(entry)

  try {
    executeAsModal(async () => {
      const result = await batchPlay(
        [
          {
            _obj: 'placeEvent',
            ID: 6,
            null: {
              _path: token,
              _kind: 'local'
            },
            freeTransformCenterState: {
              _enum: 'quadCenterState',
              _value: 'QCSAverage'
            },
            offset: {
              _obj: 'offset',
              horizontal: {
                _unit: 'pixelsUnit',
                _value: 0
              },
              vertical: {
                _unit: 'pixelsUnit',
                _value: 0
              }
            },
            _isCommand: false,
            _options: {
              dialogOptions: 'dontDisplay'
            }
          }
        ],
        {
          synchronousExecution: false,
          modalBehavior: 'fail'
        }
      )
    })
  } catch (e) {
    console.log(e)
  }
}

// document.getElementById('btnImageFileToLayer').addEventListener('click', placeEmbedded)

// open an image in the plugin folder as new document
async function openImageAction () {
  const storage = require('uxp').storage
  const fs = storage.localFileSystem
  try {
    let pluginFolder = await fs.getPluginFolder()
    // let theTemplate = await pluginFolder.getEntry("/image1.png");
    //directory where all image's request folders are. one folder for each request
    const relative_dir_path = `./server/python_server/`

    image_path = `${relative_dir_path}/${gCurrentImagePath}`
    // 'C:/Users/abdul/Desktop/photoshop_plugins/my_plugin_1/server/python_server/output- 1670544300.95411.png'
    let theTemplate = await pluginFolder.getEntry(image_path)

    await app.open(theTemplate)
  } catch (e) {
    console.log("couldn't open image ", e)
  }
}

async function openImageExe () {
  await require('photoshop').core.executeAsModal(openImageAction)
}
// document.getElementById('btnImagesToLayers').addEventListener('click',openImageExe)

// convert a layer to a smart object
async function convertToSmartObjectAction () {
  const batchPlay = require('photoshop').action.batchPlay
  const result = await batchPlay(
    [
      {
        _obj: 'newPlacedLayer',
        _isCommand: true,
        _options: {
          dialogOptions: 'dontDisplay'
        }
      }
    ],
    {}
  )
}
async function convertToSmartObjectExe () {
  await require('photoshop').core.executeAsModal(convertToSmartObjectAction)
}

async function ImagesToLayersExe () {
  for (image_path of gImage_paths) {
    gCurrentImagePath = image_path
    console.log(gCurrentImagePath)
    await openImageExe() //local image to new document
    await convertToSmartObjectExe() //convert the current image to smart object
    await stackLayers() // move the smart object to the original/old document
    await helper.layerToSelection() //transform the new smart object layer to fit selection area
    // await reselect(selectionInfo)
  }
}

// document.getElementById('btnLoadImages').addEventListener('click',ImagesToLayersExe)

//stack layer to original document
async function stackLayers () {
  //workingDoc is the project you are using stable diffusion in
  const workingDoc = app.documents[0]
  //you should not open two multiple projects this script assume there is only one project opened
  const docsToStack = app.documents.filter(doc => doc._id !== workingDoc._id)
  let docCounter = 0

  // execute as modal is required for functions that change the state of Photoshop or documents
  // think of it as a function that 'wraps' yours and tells Photoshop to go into a modal state and not allow anything to interrupt it from doing whatever is contained in the executeAsModal
  // we also call it with the await keyword to tell JS that we want to wait for it to complete before moving on to later code (in this case there isn't any though)
  await require('photoshop').core.executeAsModal(() => {
    // increment counter
    docCounter++

    // loop through other open docs
    for (const doc of docsToStack) {
      // flatten
      // doc.flatten();

      // rename layer with counter
      doc.layers[0].name = `Layer ${docCounter}`

      // increment counter
      docCounter++

      // duplicate layer to docZero
      doc.layers[0].duplicate(workingDoc)

      // close doc
      doc.closeWithoutSaving()
    }
  })
}
document.getElementById('collapsible').addEventListener('click', function () {
  this.classList.toggle('active')
  var content = this.nextElementSibling
  console.log('content:', content)
  if (content.style.display === 'block') {
    content.style.display = 'none'
    this.textContent = 'Show Samplers'
  } else {
    content.style.display = 'block'
    this.textContent = 'Hide Samplers'
  }
  // this.textContent = `${g_sd_sampler}: ${this.textContent}`
})
document.getElementById('btnLoadPromptShortcut').addEventListener('click',async function(){
  try{

    prompt_shortcut = await sdapi.loadPromptShortcut()
    var JSONInPrettyFormat = JSON.stringify(prompt_shortcut, undefined, 4);
    document.getElementById('taPromptShortcut').value = JSONInPrettyFormat
  }catch(e){
    console.warn(`loadPromptShortcut warning: ${e}`)
  }

}) 


document
  .getElementById('btnSavePromptShortcut')
  .addEventListener('click', async function () {
    try {
      

      const r1 = await dialog_box.prompt(
        'Are you sure you want to save prompt shortcut?',
        "This will override your old prompt shortcut file, you can't undo this operation",
        ['Cancel', 'Save']
      )
      if ((r1 || 'Save') !== 'Save') {
        /* cancelled or No */
        console.log("cancel")
      } else {
        /* Yes */
        console.log("Save")
        
      
      
        prompt_shortcut_string = document.getElementById('taPromptShortcut').value
        let prompt_shortcut =  JSON.parse(prompt_shortcut_string)
  
  
        prompt_shortcut = await sdapi.savePromptShortcut(prompt_shortcut)
        // var JSONInPrettyFormat = JSON.stringify(prompt_shortcut, undefined, 4);
        console.log('prompt_shortcut was saved: ', prompt_shortcut)
      
      }
    } catch (e) {
      console.warn(`savePromptShortcut warning: ${e}`)
    }



     
  })


