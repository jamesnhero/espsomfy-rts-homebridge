import type { CharacteristicValue, PlatformAccessory, Service } from 'homebridge';

import type { ExampleHomebridgePlatform } from './platform.js';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class ExamplePlatformAccessory {
  private service: Service;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private exampleStates = {
    currentPosition: 50,
    targetPosition: 50,
  };

  constructor(
    private readonly platform: ExampleHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Default-Manufacturer')
      .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

    // get the WindowCovering service if it exists, otherwise create a new WindowCovering service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.WindowCovering) || this.accessory.addService(this.platform.Service.WindowCovering);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.exampleDisplayName);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for the CurrentPosition Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.CurrentPosition)
      .onGet(this.getCurrentPosition.bind(this)); // GET - bind to the `getCurrentPosition` method below

    // register handlers for the PositionState Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.PositionState)
      .onGet(this.getPositionState.bind(this)); // GET - bind to the `getPositionState` method below

    // register handlers for the Brightness Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.TargetPosition)
      .onGet(this.getTargetPosition.bind(this)) // GET - bind to the `getTargetPosition` method below
      .onSet(this.setTargetPosition.bind(this)); // SET - bind to the `setTargetPosition` method below

    
    setInterval(() => {
      const difference = this.exampleStates.targetPosition - this.exampleStates.currentPosition;
      if (difference > 0) {
        this.exampleStates.currentPosition += Math.min(difference, 1);
        this.platform.log.debug('Blind Opening, current position ->', this.exampleStates.currentPosition);
      } else if (difference < 0) {
        this.exampleStates.currentPosition -= Math.min(-difference, 1);
        this.platform.log.debug('Blind Closing, current position ->', this.exampleStates.currentPosition);
      }
      this.updateCharacteristics();
    }, 100);
  }

  calculatePositionState() {
    let positionState;
    const difference = this.exampleStates.targetPosition - this.exampleStates.currentPosition;
    if (difference > 0) {
      positionState = this.platform.Characteristic.PositionState.INCREASING;
    } else if (difference < 0) {
      positionState = this.platform.Characteristic.PositionState.DECREASING;
    } else {
      positionState = this.platform.Characteristic.PositionState.STOPPED;
    }
    return positionState;
  }

  updateCharacteristics() {
    this.service.updateCharacteristic(this.platform.Characteristic.CurrentPosition, this.exampleStates.currentPosition);
    this.service.updateCharacteristic(this.platform.Characteristic.TargetPosition, this.exampleStates.targetPosition);
    this.service.updateCharacteristic(this.platform.Characteristic.PositionState, this.calculatePositionState());
  }

  async getCurrentPosition() {
    const currentPosition = this.exampleStates.currentPosition;
    this.platform.log.debug('Get Characteristic CurrentPosition ->', currentPosition);
    return currentPosition;
  }

  async getPositionState() {
    const positionState = this.calculatePositionState();
    this.platform.log.debug('Get Characteristic PositionState ->', positionState);
    return positionState;
  }

  async getTargetPosition() {
    const targetPosition = this.exampleStates.targetPosition;
    this.platform.log.debug('Get Characteristic TargetPosition ->', targetPosition);
    return targetPosition;
  }

  async setTargetPosition(targetPosition: CharacteristicValue) {
    this.exampleStates.targetPosition = targetPosition as number;
    this.platform.log.debug('Set Characteristic TargetPosition ->', targetPosition);
  }
}