export interface ComputerInfo {
  baseBoard: { manufacturer: string; model: string; version: string; serialNumber: string; }
  central: { name: string; vendor: string; family: string; model: string; physicalProcessorCount: number; logicalProcessorCount: number; vendorFreq: number; }
  disk: { mount: string; name: string; type: string; totalSpace: number; usableSpace: number; }[]
  memory: { manufacturer: string; memoryType: string; bankLabel: string; capacity: number; clockSpeed: number; }[]
  network: { mount: string; displayName: string; macAddr: string; ipv4: string[]; ipv6: string[]; }[]
  soundCard: { codec: string; name: string; driverVersion: string; }[]
  graphicsCard: { vendor: string; name: string; versionInfo: string; vRam: number; deviceId: string }[]
}

export interface NetworkInfo {
  bytesRecv: number
  bytesSent: number
  name: string
  totalBytesRecv: number
  totalBytesSent: number
}

export interface StatusInfo {
  jvm: { gcCount: number; heapMemoryInit: number; heapMemoryMax: number; heapMemoryUsed: number; loadClassCount: number; nonHeapMemoryInit: number; nonHeapMemoryMax: number; nonHeapMemoryUsed: number; startTime: number; threadCount: number; uptime: number; vmName: string; vmVersion: string; }
  os: { hostAddress: string; hostName: string; osArch: string; osName: string; osVersion: string; userDir: string; userHome: string; userName: string; }
  status: { desc: string; limit: number; title: string; value: number; }[]
}