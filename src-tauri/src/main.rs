// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::collections::HashMap;
use base64::{Engine as _, engine::{self, general_purpose}, alphabet};
use serde::{Serialize, Deserialize};
use serde_json;
use serde_json::Value;
const CUSTOM_ENGINE: engine::GeneralPurpose =
    engine::GeneralPurpose::new(&alphabet::URL_SAFE, general_purpose::NO_PAD);

fn main() {
  tauri::Builder::default()
  .invoke_handler(tauri::generate_handler![greet,getcaption])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
#[derive(Serialize, Deserialize, Debug)]
struct body {
  context: context_struct,
  params: String
}
#[derive(Serialize, Deserialize, Debug)]
struct context_struct{
  client: HashMap<String,String>
}

#[derive(Serialize, Deserialize, Debug)]
struct  line {
    text:String,
    start:f32
}

#[tauri::command]
fn greet(name: &str) -> String {
   format!("Hello, {}!", name)
}

#[tauri::command]
fn getcaption(id: &str) -> String {
  let mut params = HashMap::new();
  params.insert("key","AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8");
  let cli = reqwest::blocking::Client::new();
  let resp =cli.post("https://www.youtube.com/youtubei/v1/get_transcript")
  // .form(&params)
  // .header(reqwest::header::CONTENT_TYPE, "application/json")
  .body(getbody(id))
  .send()
  .expect("send error")
  .text()
  .expect("text error");

  let resbody: Value = serde_json::from_str(&resp).expect("deserialize error");

  let res1 = &resbody["actions"][0]["updateEngagementPanelAction"]["content"]["transcriptRenderer"]["body"]["transcriptBodyRenderer"]["cueGroups"];
  "".to_string();

  let arr =res1.as_array().unwrap();
  
  let mut resmap:Vec<line> = Vec::new();
  for v in arr.iter() {
      let r1= &v["transcriptCueGroupRenderer"]["cues"][0]["transcriptCueRenderer"]["cue"]["simpleText"].as_str().unwrap();
      let r2= &v["transcriptCueGroupRenderer"]["cues"][0]["transcriptCueRenderer"]["startOffsetMs"].as_str().unwrap().parse::<f32>().unwrap();;

      let item = line{
        text:r1.to_string(),
        start:*r2/1000.
      };
    resmap.push(item);
  }
  let res2 = serde_json::to_string(&resmap).expect("Serialization failed");
  res2
}

fn getbody(id:&str )->String{

  let body2 ="CgASAmVuGgA%3D".to_string();
  let body3 = format!("\n\x0b{}\x12\x0e{}",id,body2);
  let body4 = general_purpose::STANDARD.encode(body3.as_bytes());

  let mut body5 = body{
    context:context_struct{
      client:HashMap::new()
    },
    params:body4
  };
  body5.context.client.insert("clientName".to_string(), "WEB".to_string());
  body5.context.client.insert("clientVersion".to_string(), "2.2021111".to_string());

  let finalbody = serde_json::to_string(&body5).expect("Serialization failed");
  finalbody
}

#[cfg(test)]
mod tests {
    use crate::{getcaption, getbody};

    #[test]
    fn it_works() {
        let result = 2 + 2;
        println!("{}",getcaption("H14bBuluwB8")) ;
        assert_eq!(result, 4);
    }
}