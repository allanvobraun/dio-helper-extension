// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { theaterMode } from '../../settings';
import { lessonPageHtml } from '../dio/fixture.test-utils';
import { TheaterController } from './theater.controller';
import { THEATER_ATTR, THEATER_STYLE_ID } from './theater.styles';

/** Lets the controller's initial `getValue()` and storage watchers settle. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

const isOn = () => document.documentElement.hasAttribute(THEATER_ATTR);

function press(target: EventTarget, init: KeyboardEventInit = {}) {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key: 't', bubbles: true, ...init }),
  );
}

describe('TheaterController', () => {
  let controller: TheaterController | undefined;

  beforeEach(() => {
    fakeBrowser.reset();
    controller?.dispose();
    document.head.innerHTML = '';
    document.body.innerHTML = lessonPageHtml();
  });

  it('injects its stylesheet once and stays off by default', async () => {
    controller = new TheaterController();
    await settle();

    expect(document.querySelectorAll(`#${THEATER_STYLE_ID}`)).toHaveLength(1);
    expect(isOn()).toBe(false);
  });

  it('turns on at startup when the setting is on', async () => {
    await theaterMode.setValue(true);
    controller = new TheaterController();
    await settle();

    expect(isOn()).toBe(true);
  });

  it('follows the setting when it changes', async () => {
    controller = new TheaterController();
    await settle();

    await theaterMode.setValue(true);
    await settle();
    expect(isOn()).toBe(true);

    await theaterMode.setValue(false);
    await settle();
    expect(isOn()).toBe(false);
  });

  it('toggles the setting with the T key', async () => {
    controller = new TheaterController();
    await settle();

    press(document.body);
    await settle();
    expect(await theaterMode.getValue()).toBe(true);
    expect(isOn()).toBe(true);

    press(document.body, { key: 'T' });
    await settle();
    expect(await theaterMode.getValue()).toBe(false);
  });

  it.each([
    ['Ctrl', { ctrlKey: true }],
    ['Meta', { metaKey: true }],
    ['Alt', { altKey: true }],
    ['a held key', { repeat: true }],
    ['another key', { key: 'y' }],
  ])('ignores T with %s', async (_, init) => {
    controller = new TheaterController();
    await settle();

    press(document.body, init);
    await settle();

    expect(await theaterMode.getValue()).toBe(false);
  });

  it.each([
    ['an input', '<input />'],
    ['a textarea', '<textarea></textarea>'],
    ['a contenteditable', '<div contenteditable="true"><p></p></div>'],
  ])('ignores T typed in %s', async (_, html) => {
    controller = new TheaterController();
    await settle();
    const field = document.createElement('div');
    field.innerHTML = html;
    document.body.append(field);

    press(field.querySelector('input, textarea, p') as Element);
    await settle();

    expect(await theaterMode.getValue()).toBe(false);
  });

  it('ignores T on pages without a player', async () => {
    document.body.innerHTML = lessonPageHtml({ videoId: null });
    controller = new TheaterController();
    await settle();

    press(document.body);
    await settle();

    expect(await theaterMode.getValue()).toBe(false);
  });

  it('cleans the page up and stops reacting after dispose', async () => {
    await theaterMode.setValue(true);
    controller = new TheaterController();
    await settle();
    controller.dispose();

    expect(document.getElementById(THEATER_STYLE_ID)).toBeNull();
    expect(isOn()).toBe(false);

    press(document.body);
    await settle();
    expect(await theaterMode.getValue()).toBe(true);

    await theaterMode.setValue(false);
    await theaterMode.setValue(true);
    await settle();
    expect(isOn()).toBe(false);
  });
});
