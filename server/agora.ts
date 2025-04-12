import { createHmac } from 'crypto';

export class AgoraTokenGenerator {
  private appId: string;
  private appCertificate: string;

  constructor(appId: string, appCertificate: string) {
    this.appId = appId;
    this.appCertificate = appCertificate;
  }

  /**
   * Generates a token for Agora RTC
   * @param channelName The channel name
   * @param uid The user ID
   * @param expirationTimeInSeconds Token expiration time in seconds
   * @returns The generated token
   */
  public generateToken(
    channelName: string,
    uid: string,
    expirationTimeInSeconds: number = 3600
  ): string {
    // Current timestamp in seconds
    const currentTimestamp = Math.floor(Date.now() / 1000);
    
    // Calculate expiration timestamp
    const expirationTimestamp = currentTimestamp + expirationTimeInSeconds;
    
    // Generate random salt
    const salt = Math.floor(Math.random() * 100000);
    
    // Token info - using simple format for demo
    const tokenInfo = {
      appId: this.appId,
      channelName,
      uid,
      salt,
      ts: currentTimestamp,
      expire: expirationTimestamp,
    };
    
    // Create signature
    const message = `${tokenInfo.appId}${tokenInfo.channelName}${tokenInfo.uid}${tokenInfo.ts}${tokenInfo.salt}${tokenInfo.expire}`;
    const signature = createHmac('sha256', this.appCertificate)
      .update(message)
      .digest('hex');
    
    // Create token
    const token = Buffer.from(
      JSON.stringify({
        ...tokenInfo,
        signature,
      })
    ).toString('base64');
    
    return token;
  }
}
