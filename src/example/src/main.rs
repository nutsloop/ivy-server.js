use std::error::Error;
use std::ffi::OsString;
// tokio
use tokio::io::AsyncReadExt;
use tokio::net::TcpStream;

mod heap;
use heap::{heap, HeapData};

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct Data {
    heap: Option<HeapData>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {

    // get the first argument from std::env::args()

    let mut remote = true;
    let args: Vec<OsString> = std::env::args_os().skip(1).collect();
    // check if args is empty
    if args.len() > 0 {
        // check if the first argument is remote
        if &args[0] == "--not-remote" {
            remote = false;
        }else {
            println!("invalid argument use --not-remote to get heap usage locally.");
            println!("given: {:?}", &args[0]);
            std::process::exit(1);
        }
    }

    if args.len() > 1 {
        println!("only one argument is allowed and it must be --not-remote");
        std::process::exit(1);
    }

    // Connect to the server
    let mut stream = TcpStream::connect("10.0.0.2:5666").await?;
    println!("Connected to server");

    // Read and handle incoming messages from the server
    let mut buffer = [0; 1024];
    loop {
        let n = stream.read(&mut buffer).await?;
        if n == 0 {
            break;
        }
        let message = String::from_utf8_lossy(&buffer[..n]);

        // Deserialize the incoming message
        let data: Data = serde_json::from_str(&message)?;
        // check if data has heap field
        // if it does, call heap function
        if let Some(heap_called) = data.heap {
            heap(heap_called, remote)?;
        }
    }

    Ok(())
}
