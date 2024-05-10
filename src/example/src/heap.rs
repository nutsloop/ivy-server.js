use serde::{Deserialize, Serialize};
use serde_json::Result;
use sysinfo::{Pid, System};

#[derive(Serialize, Deserialize, Debug)]
pub struct HeapData {
    wrk: String,
    id: u8,
    pid: u32,
    usage: f32,
}

pub fn heap(heap_usage: HeapData, remote: bool) -> Result<()> {
    // Serialize it to a JSON string.

    println!("{:#?}", heap_usage);
    // this is more real time data than the data given by ivy-server but, it works only
    // if the ivy-control-room (this app) run on the same machine as the ivy-server.
    // the purpose of all this is to get the heap usage for the ivy-server remotely.
    // ivy-server send data related to memory with big timing delaybut it send it.
    // consider also the latency of remotely sending data.
    if ! remote{
      let s = System::new_all();
      if let Some(process) = s.process(Pid::from_u32(heap_usage.pid)) {
          let data = process.memory() as f64 / 1024.0 / 1024.0;
          println!("{} mb", data);
      }
    }
    Ok(())
}
