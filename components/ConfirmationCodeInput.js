import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {View, TextInput, StyleSheet, Dimensions} from 'react-native'
import _ from 'lodash'

export default class ConfirmationCodeInput extends Component {
	static propTypes = {
		codeLength: PropTypes.number,
		compareWithCode: PropTypes.string,
		inputPosition: PropTypes.string,
		size: PropTypes.number,
		space: PropTypes.number,
		className: PropTypes.string,
		cellBorderWidth: PropTypes.number,
		activeColor: PropTypes.string,
		inactiveColor: PropTypes.string,
		ignoreCase: PropTypes.bool,
		autoFocus: PropTypes.bool,
		codeInputStyle: TextInput.propTypes.style,
		containerStyle: View.propTypes.style,
		onFulfill: PropTypes.func,
		inputComponent: React.PropTypes.func,
	}

	static defaultProps = {
		codeLength: 5,
		inputPosition: 'center',
		autoFocus: true,
		size: 40,
		className: 'border-box',
		cellBorderWidth: 1,
		activeColor: 'rgba(255, 255, 255, 1)',
		inactiveColor: 'rgba(255, 255, 255, 0.2)',
		space: 8,
		compareWithCode: '',
		ignoreCase: false,
		inputComponent: TextInput,
	}

	constructor(props) {
		super(props)

		this.state = {
			codeArr: new Array(this.props.codeLength).fill(''),
			currentIndex: 0,
		}

		this.codeInputRefs = []
	}

	componentDidMount() {
		const {compareWithCode, codeLength, inputPosition} = this.props
		if (compareWithCode && compareWithCode.length !== codeLength) {
			console.error('Invalid props: compareWith length is not equal to codeLength')
		}

		if (_.indexOf(['center', 'left', 'right', 'full-width'], inputPosition) === -1) {
			console.error('Invalid input position. Must be in: center, left, right, full')
		}
	}

	clear() {
		this.setState({
			codeArr: new Array(this.props.codeLength).fill(''),
			currentIndex: 0,
		})
		this._setFocus(0)
	}

	_setFocus(index) {
		this.codeInputRefs[index].focus()
	}

	_blur(index) {
		this.codeInputRefs[index].blur()
	}

	_onFocus(index) {
		const {codeArr} = this.state
		const currentEmptyIndex = _.findIndex(codeArr, c => !c)
		if (currentEmptyIndex !== -1 && currentEmptyIndex < index) {
			return this._setFocus(currentEmptyIndex)
		}
		const newCodeArr = codeArr.map((v, i) => (i < index ? v : ''))

		this.setState({
			codeArr: newCodeArr,
			currentIndex: index,
		})
	}

	_isMatchingCode(code, compareWithCode, ignoreCase = false) {
		if (ignoreCase) {
			return code.toLowerCase() == compareWithCode.toLowerCase()
		}
		return code == compareWithCode
	}

	_getContainerStyle(size, position) {
		switch (position) {
			case 'left':
				return {
					justifyContent: 'flex-start',
					height: size,
				}
			case 'center':
				return {
					justifyContent: 'center',
					height: size,
				}
			case 'right':
				return {
					justifyContent: 'flex-end',
					height: size,
				}
			default:
				return {
					justifyContent: 'space-between',
					height: size,
				}
		}
	}

	_getInputSpaceStyle(space) {
		const {inputPosition} = this.props
		switch (inputPosition) {
			case 'left':
				return {
					marginRight: space,
				}
			case 'center':
				return {
					marginRight: space / 2,
					marginLeft: space / 2,
				}
			case 'right':
				return {
					marginLeft: space,
				}
			default:
				return {
					marginRight: 0,
					marginLeft: 0,
				}
		}
	}

	_getClassStyle(className, active) {
		const {cellBorderWidth, activeColor, inactiveColor, space} = this.props
		const classStyle = {
			...this._getInputSpaceStyle(space),
			color: activeColor,
		}

		switch (className) {
			case 'clear':
				return Object.assign({}, classStyle, {borderWidth: 0})
			case 'border-box':
				return Object.assign({}, classStyle, {
					borderWidth: cellBorderWidth,
					borderColor: active ? activeColor : inactiveColor,
				})
			case 'border-circle':
				return Object.assign({}, classStyle, {
					borderWidth: cellBorderWidth,
					borderRadius: 50,
					borderColor: active ? activeColor : inactiveColor,
				})
			case 'border-b':
				return Object.assign({}, classStyle, {
					borderBottomWidth: cellBorderWidth,
					borderColor: active ? activeColor : inactiveColor,
				})
			case 'border-b-t':
				return Object.assign({}, classStyle, {
					borderTopWidth: cellBorderWidth,
					borderBottomWidth: cellBorderWidth,
					borderColor: active ? activeColor : inactiveColor,
				})
			case 'border-l-r':
				return Object.assign({}, classStyle, {
					borderLeftWidth: cellBorderWidth,
					borderRightWidth: cellBorderWidth,
					borderColor: active ? activeColor : inactiveColor,
				})
			default:
				return className
		}
	}

	_onKeyPress(e) {
		if (e.nativeEvent.key === 'Backspace') {
			const {currentIndex} = this.state
			const nextIndex = currentIndex > 0 ? currentIndex - 1 : 0
			this._setFocus(nextIndex)
		}
	}

	_onInputCode(character, index) {
		const {codeLength, onFulfill, compareWithCode, ignoreCase} = this.props
		let newCodeArr = _.clone(this.state.codeArr)
		newCodeArr[index] = character

		if (index == codeLength - 1) {
			const code = newCodeArr.join('')

			if (compareWithCode) {
				const isMatching = this._isMatchingCode(code, compareWithCode, ignoreCase)
				onFulfill(isMatching, code)
				!isMatching && this.clear()
			} else {
				onFulfill(code)
			}
			this._blur(this.state.currentIndex)
		} else {
			this._setFocus(this.state.currentIndex + 1)
		}

		this.setState(prevState => {
			return {
				codeArr: newCodeArr,
				currentIndex: prevState.currentIndex + 1,
			}
		})
	}

	render() {
		const {
			codeLength,
			codeInputStyle,
			containerStyle,
			inputPosition,
			autoFocus,
			className,
			size,
			activeColor,
		} = this.props

		const Component = this.props.inputComponent

		const initialCodeInputStyle = {
			width: size,
			height: size,
		}

		const codeInputs = _.range(codeLength).map(id => (
			<Component
				key={id}
				ref={ref => (this.codeInputRefs[id] = ref)}
				style={[
					styles.codeInput,
					initialCodeInputStyle,
					this._getClassStyle(className, this.state.currentIndex == id),
					codeInputStyle,
				]}
				underlineColorAndroid="transparent"
				selectionColor={activeColor}
				keyboardType={'name-phone-pad'}
				returnKeyType={'done'}
				{...this.props}
				autoFocus={autoFocus && id == 0}
				onFocus={() => this._onFocus(id)}
				value={this.state.codeArr[id] ? this.state.codeArr[id].toString() : ''}
				onChangeText={text => this._onInputCode(text, id)}
				onKeyPress={e => this._onKeyPress(e)}
				maxLength={1}
			/>
		))

		return (
			<View
				style={[
					styles.container,
					this._getContainerStyle(size, inputPosition),
					containerStyle,
				]}>
				{codeInputs}
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row',
		marginTop: 20,
	},
	codeInput: {
		backgroundColor: 'transparent',
		textAlign: 'center',
		padding: 0,
	},
})
	